import { Router } from 'express';
import {
  getRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  toggleAttendance,
  deleteRegistration,
  getStats,
  exportCsv,
  downloadPdf
} from '../controllers/registrationController.js';
import { INSTITUTION, CATEGORIES, SPORTS_DIVISIONS, CULTURAL_EVENTS } from '../../config/eventConfig.js';
import { EVENT_DETAILS } from '../config/eventSchedule.js';

const router = Router();

// Registrations CRUD & Operations
router.get('/registrations', getRegistrations);
router.get('/registrations/:id', getRegistrationById);
router.get('/registrations/:id/pdf', downloadPdf);
router.post('/registrations', createRegistration);
router.put('/registrations/:id', updateRegistration);
router.patch('/registrations/:id/attendance', toggleAttendance);
router.delete('/registrations/:id', deleteRegistration);

// Statistics & Exports
router.get('/stats', getStats);
router.get('/export-csv', exportCsv);

// Event Definitions & Schedules
router.get('/events', (req, res) => {
  return res.status(200).json({
    success: true,
    institution: INSTITUTION,
    categories: CATEGORIES,
    sports: SPORTS_DIVISIONS,
    cultural: CULTURAL_EVENTS,
    eventDetails: EVENT_DETAILS
  });
});

export default router;
