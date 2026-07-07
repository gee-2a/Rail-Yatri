const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, getAllBookings, getLiveTrainStatus, downloadTicketPDF, getBookingById } = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getUserBookings)
    .post(protect, createBooking);

router.route('/all').get(protect, admin, getAllBookings);

router.route('/:id').get(protect, getBookingById);
router.route('/:id/cancel').put(protect, cancelBooking);
router.route('/:id/ticket-pdf').get(protect, downloadTicketPDF);

router.route('/live-status/:trainNumber').get(protect, getLiveTrainStatus);

module.exports = router;
