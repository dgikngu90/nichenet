const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: 'video',
    folder: 'study-platform',
    chunk_size: 6000000,
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const videos = await req.prisma.video.findMany({
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, requireRole('TEACHER'), upload.single('video'), async (req, res) => {
  try {
    const { title, description, videoUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let cloudinaryUrl = videoUrl;
    let publicId = null;

    if (req.file) {
      cloudinaryUrl = req.file.path;
      publicId = req.file.filename;
    } else if (!videoUrl) {
      return res.status(400).json({ error: 'Video file or URL is required' });
    }

    const video = await req.prisma.video.create({
      data: {
        title,
        description,
        cloudinaryUrl,
        publicId: publicId || 'url-' + Date.now(),
        teacherId: req.user.id,
      },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/my', authenticate, requireRole('TEACHER'), async (req, res) => {
  try {
    const videos = await req.prisma.video.findMany({
      where: { teacherId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(videos);
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireRole('TEACHER'), async (req, res) => {
  try {
    const video = await req.prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (video.publicId && !video.publicId.startsWith('url-')) {
      try {
        await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
      } catch (e) {
        console.log('Cloudinary delete error:', e.message);
      }
    }

    await req.prisma.video.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Video deleted' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
