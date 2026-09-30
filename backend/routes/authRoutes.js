import { Router } from 'express';
import { loginAdmin, verifyAdminToken } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginAdmin);
router.get('/verify', verifyAdminToken);

export default router;
