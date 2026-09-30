import { Router } from 'express';
import {
  getResults,
  createResult,
  updateResult,
  deleteResult,
  getFaculty
} from '../controllers/resultController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public: View tournament winners and faculty panel
router.get('/', getResults);
router.get('/faculty', getFaculty);

// Protected: Admin updates
router.post('/', requireAdminAuth, createResult);
router.put('/:id', requireAdminAuth, updateResult);
router.delete('/:id', requireAdminAuth, deleteResult);

export default router;
