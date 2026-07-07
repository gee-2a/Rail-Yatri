const express = require('express');
const router = express.Router();
const { createTrain, getTrains, updateTrain, deleteTrain, getAnalytics, getTrainBookings, getTrainById } = require('../controllers/trainController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/analytics').get(protect, admin, getAnalytics);

router.route('/')
    .get(getTrains)
    .post(protect, admin, createTrain);

router.route('/:id')
    .get(getTrainById)
    .put(protect, admin, updateTrain)
    .delete(protect, admin, deleteTrain);

router.route('/:id/bookings').get(protect, admin, getTrainBookings);

module.exports = router;

