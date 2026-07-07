const Train = require('../models/Train');
const Booking = require('../models/Booking');
const { searchLiveTrains } = require('../utils/railwayApiService');

exports.getAnalytics = async (req, res) => {
    try {
        const totalRevenueResult = await Booking.aggregate([
            { $match: { status: { $in: ['Confirmed', 'RAC'] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueResult.length ? totalRevenueResult[0].total : 0;

        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
        const racBookings = await Booking.countDocuments({ status: 'RAC' });
        const waitlistBookings = await Booking.countDocuments({ status: 'Waitlist' });
        const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

        res.json({ 
            totalRevenue, 
            totalBookings,
            confirmedBookings,
            racBookings,
            waitlistBookings,
            cancelledBookings
        });
    } catch (error) {
        console.error('getAnalytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createTrain = async (req, res) => {
    try {
        const totalSeats = req.body.totalSeats || 388;
        const racCapacity = Math.max(10, Math.ceil(totalSeats * 0.05));
        const train = await Train.create({ ...req.body, availableSeats: totalSeats, racCapacity, racBooked: 0 });
        res.status(201).json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrains = async (req, res) => {
    try {
        const { source, destination, date } = req.query;

        // 1. Try to search live trains from RailRadar API
        const liveTrains = await searchLiveTrains(source, destination, date);
        console.log('Live trains result:', liveTrains);
        console.log('Live trains count:', liveTrains ? liveTrains.length : 'null');
        if (liveTrains && liveTrains.length > 0) {
            return res.json(liveTrains);
        }

        // 2. Fall back to local DB
        let query = {};
        if (source) query.source = new RegExp(source, 'i');
        if (destination) query.destination = new RegExp(destination, 'i');
        if (date) {
            const start = new Date(date);
            start.setHours(0,0,0,0);
            const end = new Date(date);
            end.setHours(23,59,59,999);
            query.departureTime = { $gte: start, $lte: end };
        }
        
        console.log('Falling back to local database search');
        const trains = await Train.find(query);
        res.json(trains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTrain = async (req, res) => {
    try {
        await Train.findByIdAndDelete(req.params.id);
        res.json({ message: 'Train removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTrain = async (req, res) => {
    try {
        const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrainBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ train: req.params.id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const confirmed = bookings.filter(b => b.status === 'Confirmed');
        const rac = bookings.filter(b => b.status === 'RAC');
        const waitlist = bookings.filter(b => b.status === 'Waitlist');
        const totalRevenue = [...confirmed, ...rac].reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        res.json({
            bookings,
            stats: {
                totalBookings: bookings.length,
                confirmedBookings: confirmed.length,
                racBookings: rac.length,
                waitlistBookings: waitlist.length,
                cancelledBookings: bookings.filter(b => b.status === 'Cancelled').length,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrainById = async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);
        if (!train) {
            return res.status(404).json({ message: 'Train not found' });
        }
        res.json(train);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
