const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const quizzes = await req.prisma.quiz.findMany({
      include: {
        teacher: {
          select: { id: true, name: true },
        },
        questions: {
          select: { id: true, questionText: true, options: true },
        },
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const quizzesWithParsed = quizzes.map(q => ({
      ...q,
      questions: q.questions.map(qu => ({ ...qu, options: JSON.parse(qu.options) }))
    }));

    if (req.user.role === 'STUDENT') {
      const quizzesWithAttempts = await Promise.all(
        quizzesWithParsed.map(async (quiz) => {
          const attempt = await req.prisma.quizAttempt.findFirst({
            where: {
              quizId: quiz.id,
              studentId: req.user.id,
            },
          });
          return {
            ...quiz,
            attempted: !!attempt,
            bestScore: attempt?.score,
          };
        })
      );
      return res.json(quizzesWithAttempts);
    }

    res.json(quizzesWithParsed);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my', authenticate, requireRole('TEACHER'), async (req, res) => {
  try {
    const quizzes = await req.prisma.quiz.findMany({
      where: { teacherId: req.user.id },
      include: {
        questions: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const quizzesWithParsed = quizzes.map(q => ({
      ...q,
      questions: q.questions.map(qu => ({ ...qu, options: JSON.parse(qu.options) }))
    }));
    res.json(quizzesWithParsed);
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const quiz = await req.prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            correctAnswer: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizWithParsed = {
      ...quiz,
      questions: quiz.questions.map(q => ({ ...q, options: JSON.parse(q.options) }))
    };

    if (req.user.role === 'STUDENT') {
      const sanitized = {
        ...quizWithParsed,
        questions: quizWithParsed.questions.map(({ correctAnswer, ...q }) => q),
      };
      return res.json(sanitized);
    }

    res.json(quizWithParsed);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, requireRole('TEACHER'), async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    const quiz = await req.prisma.quiz.create({
      data: {
        title,
        description,
        teacherId: req.user.id,
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
          })),
        },
      },
      include: {
        questions: true,
        teacher: {
          select: { id: true, name: true },
        },
      },
    });

    const quizWithParsed = {
      ...quiz,
      questions: quiz.questions.map(q => ({ ...q, options: JSON.parse(q.options) }))
    };

    res.status(201).json(quizWithParsed);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireRole('TEACHER'), async (req, res) => {
  try {
    const quiz = await req.prisma.quiz.findUnique({
      where: { id: req.params.id },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await req.prisma.quiz.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/submit', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await req.prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += 1;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentageScore = Math.round((score / totalQuestions) * 100);

    const attempt = await req.prisma.quizAttempt.create({
      data: {
        studentId: req.user.id,
        quizId: req.params.id,
        score: percentageScore,
        answers: JSON.stringify(answers),
      },
    });

    res.json({
      attempt,
      score: percentageScore,
      correctAnswers: score,
      totalQuestions,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/results', authenticate, requireRole('TEACHER'), async (req, res) => {
  try {
    const quiz = await req.prisma.quiz.findUnique({
      where: { id: req.params.id },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const attempts = await req.prisma.quizAttempt.findMany({
      where: { quizId: req.params.id },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const attemptsWithParsed = attempts.map(a => ({
      ...a,
      answers: JSON.parse(a.answers)
    }));

    res.json(attemptsWithParsed);
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
