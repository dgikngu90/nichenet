const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, tags, isPrivate } = req.body;

    // Create new group
    const group = new Group({
      name,
      description,
      creator: req.user.id,
      tags: tags || [],
      isPrivate: isPrivate || false
    });

    await group.save();

    // Add creator to members
    group.members.push(req.user.id);
    await group.save();

    res.status(201).json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all groups (with optional filtering)
exports.getGroups = async (req, res) => {
  try {
    const { tag, search } = req.query;
    let filter = {};

    // Filter by tag
    if (tag) {
      filter.tags = tag;
    }

    // Filter by search term
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude private groups unless user is member
    // For simplicity in MVP, we'll show all non-private groups
    filter.isPrivate = false;

    const groups = await Group.find(filter)
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar');

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check if user is member or group is public
    const isMember = group.members.some(member => member._id.toString() === req.user.id);
    if (!group.isPrivate || isMember) {
      res.json(group);
    } else {
      res.status(403).json({ msg: 'Access denied to private group' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check if already a member
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member of this group' });
    }

    // Add user to group members
    group.members.push(req.user.id);
    await group.save();

    // Add group to user's groups (if we had that field)
    // For now, we'll just return the updated group
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Not a member of this group' });
    }

    // Remove user from group members
    group.members = group.members.filter(
      member => member.toString() !== req.user.id
    );
    await group.save();

    res.json({ msg: 'Left group successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('creator', 'username avatar');

    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
