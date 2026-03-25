const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @route   GET api/events
// @desc    Get all events
// @access  Private
router.get('/', eventController.getEvents);

// @route   GET api/events/my
// @desc    Get user's events (RSVP'd)
// @access  Private
router.get('/my', eventController.getUserEvents);

// @route   POST api/events
// @desc    Create an event
// @access  Private
router.post('/', eventController.createEvent);

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', eventController.getEventById);

// @route   POST api/events/:id/rsvp
// @desc    RSVP to an event
// @access  Private
router.post('/:id/rsvp', eventController.rsvpEvent);

// @route   POST api/events/:id/cancel-rsvp
// @desc    Cancel RSVP to an event
// @access  Private
router.post('/:id/cancel-rsvp', eventController.cancelRsvp);

module.exports = router;
