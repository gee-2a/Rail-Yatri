const Booking = require('../models/Booking');
const Train = require('../models/Train');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const pdfService = require('../utils/pdfService');
const { getLiveStatus } = require('../utils/railwayApiService');

const getMultiplier = (coachCode) => {
    if(coachCode === 'General') return 1;
    if(coachCode === '3E') return 2;
    if(coachCode === '3A') return 2.5;
    if(coachCode === '2A') return 3;
    if(coachCode === '1A') return 4;
    return 1;
};

// Helper: get next waitlist number for a train
const getNextWaitlistNumber = async (trainId) => {
    const lastWL = await Booking.findOne({ train: trainId, waitlistNumber: { $ne: null } })
        .sort({ waitlistNumber: -1 });
    return lastWL ? lastWL.waitlistNumber + 1 : 1;
};

// Promote RAC → Confirmed, WL → RAC after a cancellation
const promoteBookings = async (trainId) => {
    const train = await Train.findById(trainId);
    if (!train) return;

    // Promote RAC → Confirmed (if confirmed seats now available)
    while (train.availableSeats > 0) {
        const oldestRAC = await Booking.findOne({ train: trainId, status: 'RAC' }).sort({ createdAt: 1 });
        if (!oldestRAC) break;

        const seatsToPromote = Math.min(oldestRAC.seatsCount, train.availableSeats);
        if (seatsToPromote < oldestRAC.seatsCount) break; // can't partially promote

        oldestRAC.status = 'Confirmed';
        oldestRAC.paymentStatus = 'Success';
        await oldestRAC.save();
        train.availableSeats -= oldestRAC.seatsCount;
        train.racBooked -= oldestRAC.seatsCount;

        // Notify user of promotion
        const populatedBooking = await oldestRAC.populate('train');
        const user = await User.findById(oldestRAC.user);
        if (user) {
            sendEmail({
                email: user.email,
                subject: `RailYatri — Promoted to Confirmed! ${populatedBooking.train.name}`,
                message: `Hello ${user.name},\n\nGreat news! Your RAC booking has been promoted to CONFIRMED.\n\nTrain: ${populatedBooking.train.name} (${populatedBooking.train.number})\nPassengers: ${oldestRAC.passengers.map(p => p.name).join(', ')}\nBooking ID: ${oldestRAC._id}\n\nHappy journey!`
            }).catch(() => {});
        }
    }

    // Promote WL → RAC (if RAC slots now available)
    const racCapacity = train.racCapacity || Math.max(10, Math.ceil(train.totalSeats * 0.05));
    while (train.racBooked < racCapacity) {
        const oldestWL = await Booking.findOne({ train: trainId, status: 'Waitlist' }).sort({ waitlistNumber: 1 });
        if (!oldestWL) break;

        if (train.racBooked + oldestWL.seatsCount > racCapacity) break;

        oldestWL.status = 'RAC';
        oldestWL.paymentStatus = 'Success';
        oldestWL.waitlistNumber = null;
        await oldestWL.save();
        train.racBooked += oldestWL.seatsCount;

        // Add seats to bookedSeats for RAC
        const seatNumbers = oldestWL.passengers.map(p => p.seatNumber);
        train.bookedSeats.push(...seatNumbers);

        const user = await User.findById(oldestWL.user);
        if (user) {
            sendEmail({
                email: user.email,
                subject: `RailYatri — Promoted to RAC! ${train.name}`,
                message: `Hello ${user.name},\n\nYour waitlisted booking has been promoted to RAC.\n\nTrain: ${train.name} (${train.number})\nBooking ID: ${oldestWL._id}\n\nYou'll be notified if you get further promoted to Confirmed.`
            }).catch(() => {});
        }
    }

    await train.save();
};

exports.createBooking = async (req, res) => {
    try {
        const { trainId, passengers } = req.body;
        
        const train = await Train.findById(trainId);
        if (!train) return res.status(404).json({ message: 'Train not found' });

        if (new Date() > new Date(train.departureTime)) {
            return res.status(400).json({ message: 'Cannot book tickets for a train that has already departed.' });
        }

        if (!passengers || passengers.length === 0) {
            return res.status(400).json({ message: 'No passengers provided.' });
        }

        const seatsCount = passengers.length;
        const seatNumbers = passengers.map(p => p.seatNumber);

        // check if any seats are already booked
        const alreadyBooked = seatNumbers.some(seat => train.bookedSeats.includes(seat));
        if (alreadyBooked) {
            return res.status(400).json({ message: 'One or more selected seats are already booked.' });
        }
        
        // Calculate dynamic pricing
        let totalAmount = 0;
        const enrichedPassengers = passengers.map(p => {
            const coach = p.seatNumber.split('-')[0];
            const price = Math.round(train.basePrice * getMultiplier(coach));
            totalAmount += price;
            return {
                name: p.name,
                age: p.age,
                seatNumber: p.seatNumber,
                price: price
            };
        });

        // Determine booking status based on availability
        let bookingStatus = 'Confirmed';
        let waitlistNumber = null;
        const racCapacity = train.racCapacity || Math.max(10, Math.ceil(train.totalSeats * 0.05));

        if (train.availableSeats >= seatsCount) {
            bookingStatus = 'Confirmed';
            train.availableSeats -= seatsCount;
            train.bookedSeats.push(...seatNumbers);
        } else if (train.racBooked + seatsCount <= racCapacity) {
            bookingStatus = 'RAC';
            train.racBooked += seatsCount;
            train.bookedSeats.push(...seatNumbers);
        } else {
            bookingStatus = 'Waitlist';
            waitlistNumber = await getNextWaitlistNumber(trainId);
        }

        await train.save();

        const booking = await Booking.create({
            user: req.user.id,
            train: trainId,
            seatsCount,
            passengers: enrichedPassengers,
            totalAmount: totalAmount,
            status: bookingStatus,
            paymentStatus: bookingStatus === 'Waitlist' ? 'Pending' : 'Success',
            waitlistNumber
        });

        const populatedBooking = await booking.populate('train user');

        // Generate PDF Ticket
        let ticketPdfBuffer = null;
        try {
            ticketPdfBuffer = await pdfService.generateTicketPDF(populatedBooking);
        } catch (pdfErr) {
            console.error('Failed to generate PDF:', pdfErr);
        }

        try {
            const emailOptions = {
                email: req.user.email || populatedBooking.user.email,
                subject: `Your RailYatri Ticket is Ready! 🚆 — ${populatedBooking.train.name}`,
                message: `Hello ${populatedBooking.user.name},\n\nYour booking is confirmed!\nTrain: ${populatedBooking.train.name} (${populatedBooking.train.number})\nFrom: ${populatedBooking.train.source} → To: ${populatedBooking.train.destination}\nDeparture: ${new Date(populatedBooking.train.departureTime).toLocaleString()}\nStatus: ${booking.status}\nBooking ID: ${booking._id}\n\nHappy travels!\nTeam RailYatri`,
                meta: {
                    userName: populatedBooking.user.name,
                    trainName: populatedBooking.train.name,
                    trainNumber: populatedBooking.train.number,
                    source: populatedBooking.train.source,
                    destination: populatedBooking.train.destination,
                    departureTime: populatedBooking.train.departureTime,
                    status: booking.status,
                    bookingId: booking._id
                }
            };
            
            if (ticketPdfBuffer) {
                emailOptions.attachments = [
                    {
                        filename: `RailYatri_Ticket_${booking._id}.pdf`,
                        content: ticketPdfBuffer,
                        contentType: 'application/pdf'
                    }
                ];
            }

            await sendEmail(emailOptions);
        } catch(err) {
            console.error('Email failed: ', err);
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('train').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('train user')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        const train = await Train.findById(booking.train);
        
        const now = new Date();
        const departure = new Date(train.departureTime);
        const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);

        if (hoursUntilDeparture < 4) {
            return res.status(400).json({ message: 'Cancellation not allowed less than 4 hours before departure.' });
        }

        let refundPercentage = 0.50; // default 50% for 4-24 hours
        if (hoursUntilDeparture > 24) {
            refundPercentage = 0.75; // 75% for > 24 hours
        }
        
        const refundAmount = Math.round(booking.totalAmount * refundPercentage);
        const seatNumbers = booking.passengers.map(p => p.seatNumber);
        
        // Restore seats exactly back to database
        const previousStatus = booking.status;
        if (previousStatus === 'Confirmed') {
            train.availableSeats += booking.seatsCount;
            if (seatNumbers && seatNumbers.length > 0) {
                train.bookedSeats = train.bookedSeats.filter(seat => !seatNumbers.includes(seat));
            }
        } else if (previousStatus === 'RAC') {
            train.racBooked -= booking.seatsCount;
            if (seatNumbers && seatNumbers.length > 0) {
                train.bookedSeats = train.bookedSeats.filter(seat => !seatNumbers.includes(seat));
            }
        }

        booking.status = 'Cancelled';
        await booking.save();
        await train.save();
        
        // Cancellation Confirmation Email
        const populatedCancelledBooking = await booking.populate('train user');
        let passengerSummary = booking.passengers.map(p => `${p.name} (Seat ${p.seatNumber})`).join(', ');

        try {
            await sendEmail({
                email: req.user.email || populatedCancelledBooking.user.email,
                subject: 'Railyatri Booking Cancelled',
                message: `Hello ${populatedCancelledBooking.user.name},\n\nYour booking has been successfully Cancelled.\nTrain: ${populatedCancelledBooking.train.name} (${populatedCancelledBooking.train.number})\nSeats Refunded: ${booking.seatsCount}\nPassengers: ${passengerSummary}\nTotal Fare: ₹${booking.totalAmount}\nRefund Processing (${refundPercentage * 100}%): ₹${refundAmount}\nBooking ID: ${booking._id}\n\nHope to see you again soon.`
            });
        } catch(err) {
            console.error('Cancellation Email failed: ', err);
        }
        
        // Promote waitlisted/RAC bookings
        await promoteBookings(booking.train);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.downloadTicketPDF = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('train user');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const pdfBuffer = await pdfService.generateTicketPDF(booking);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket_${booking._id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Download Error:', error);
        res.status(500).json({ message: 'Could not generate PDF ticket.' });
    }
};

exports.getLiveTrainStatus = async (req, res) => {
    try {
        const { trainNumber } = req.params;
        const status = await getLiveStatus(trainNumber);
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('train')
            .populate('user', 'name email role');
            
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
