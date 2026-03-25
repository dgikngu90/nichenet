const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let messages;

    if (req.user.role === 'TEACHER') {
      messages = await req.prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id },
            { recipientId: req.user.id },
            { isBroadcast: true },
          ],
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true },
          },
          recipient: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      messages = await req.prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id },
            { recipientId: req.user.id },
            { isBroadcast: true, sender: { role: 'TEACHER' } },
          ],
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true },
          },
          recipient: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { recipientId, content, isBroadcast } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (req.user.role === 'STUDENT') {
      if (!recipientId) {
        return res.status(400).json({ error: 'Recipient is required for students' });
      }

      const recipient = await req.prisma.user.findUnique({
        where: { id: recipientId },
      });

      if (!recipient || recipient.role !== 'TEACHER') {
        return res.status(400).json({ error: 'Students can only message teachers' });
      }

      const message = await req.prisma.message.create({
        data: {
          senderId: req.user.id,
          recipientId,
          content,
          isBroadcast: false,
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true },
          },
          recipient: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return res.status(201).json(message);
    }

    if (req.user.role === 'TEACHER') {
      if (isBroadcast) {
        const students = await req.prisma.user.findMany({
          where: { role: 'STUDENT' },
        });

        const messages = await Promise.all(
          students.map((student) =>
            req.prisma.message.create({
              data: {
                senderId: req.user.id,
                recipientId: student.id,
                content,
                isBroadcast: true,
              },
            })
          )
        );

        return res.status(201).json({ message: 'Broadcast sent', count: messages.length });
      }

      if (!recipientId) {
        return res.status(400).json({ error: 'Recipient is required' });
      }

      const message = await req.prisma.message.create({
        data: {
          senderId: req.user.id,
          recipientId,
          content,
          isBroadcast: false,
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true },
          },
          recipient: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return res.status(201).json(message);
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', authenticate, async (req, res) => {
  try {
    let users;

    if (req.user.role === 'TEACHER') {
      users = await req.prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      });
    } else {
      users = await req.prisma.user.findMany({
        where: { role: 'TEACHER' },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      });
    }

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
