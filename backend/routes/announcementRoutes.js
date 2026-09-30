import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public: View all announcements
router.get('/', getAnnouncements);

// Protected: Admin updates
router.post('/', requireAdminAuth, createAnnouncement);
router.put('/:id', requireAdminAuth, updateAnnouncement);
router.delete('/:id', requireAdminAuth, deleteAnnouncement);

export default router;
