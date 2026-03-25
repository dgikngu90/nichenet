const Event = require('../models/Event');
const Group = require('../models/Group');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, groupId, isPaid, price } = req.body;

    // Check if group exists (if provided)
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
      }
      // Check if user is member of the group
      if (!group.members.includes(req.user.id)) {
        return res.status(403).json({ msg: 'Must be a member of the group to create an event' });
      }
    }

    // Create new event
    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      creator: req.user.id,
      group: groupId || null,
      isPaid: isPaid || false,
      price: price || 0
    });

    await event.save();

    res.status(201).json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all events (with optional filtering)
exports.getEvents = async (req, res) => {
  try {
    const { groupId, search } = req.query;
    let filter = {};

    // Filter by group
    if (groupId) {
      filter.group = groupId;
    }

    // Filter by search term
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Only show upcoming events (date >= today)
    filter.date = { $gte: new Date() };

    const events = await Event.find(filter)
      .populate('creator', 'username avatar')
      .populate('group', 'name')
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('group', 'name')
      .populate('attendees', 'username avatar');

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// RSVP to an event
exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if already RSVP'd
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already RSVP\'d to this event' });
    }

    // Add user to event attendees
    event.attendees.push(req.user.id);
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Cancel RSVP
exports.cancelRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user has RSVP'd
    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Not RSVP\'d to this event' });
    }

    // Remove user from event attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.user.id
    );
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's events (events they've RSVP'd to)
exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.id })
      .populate('creator', 'username avatar')
      .populate('group', 'name')
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
