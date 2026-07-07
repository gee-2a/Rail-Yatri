const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    seatNumber: { type: String, required: true },
    price: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
    seatsCount: { type: Number, required: true },
    passengers: { type: [passengerSchema], default: [] },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Confirmed', 'RAC', 'Waitlist', 'Cancelled'], default: 'Confirmed' },
    paymentStatus: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
    waitlistNumber: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
