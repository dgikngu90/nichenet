const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @route   GET api/groups
// @desc    Get all groups
// @access  Private
router.get('/', groupController.getGroups);

// @route   GET api/groups/my
// @desc    Get user's groups
// @access  Private
router.get('/my', groupController.getUserGroups);

// @route   POST api/groups
// @desc    Create a group
// @access  Private
router.post('/', groupController.createGroup);

// @route   GET api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', groupController.getGroupById);

// @route   POST api/groups/:id/join
// @desc    Join a group
// @access  Private
router.post('/:id/join', groupController.joinGroup);

// @route   POST api/groups/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/:id/leave', groupController.leaveGroup);

module.exports = router;
