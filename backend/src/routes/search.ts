import { Router } from 'express';
import { query } from 'express-validator';
import * as searchController from '../controllers/searchController';

const router = Router();

// Public search endpoint
router.get('/', [
  query('q').optional().isLength({ min: 1, max: 100 }),
  query('type').optional().isIn(['communities', 'posts', 'users', 'all']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], searchController.search);

export default router;
