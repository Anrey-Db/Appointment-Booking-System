const express = require('express');
const { body, param } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/appointments (Create appointment)
router.post(
  '/',
  [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('purpose').notEmpty().withMessage('Purpose is required'),
    body('preferredStaff').optional().isString()
  ],
  appointmentController.createAppointment
);

// GET /api/appointments (Get appointments)
router.get('/', appointmentController.getAppointments);

// PUT /api/appointments/:id/approve (Approve - Admin/Staff only)
router.put(
  '/:id/approve',
  [
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('remarks').optional().isString()
  ],
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }
    appointmentController.approveAppointment(req, res, next);
  }
);

// PUT /api/appointments/:id/reject (Reject - Admin/Staff only)
router.put(
  '/:id/reject',
  [
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('remarks').optional().isString()
  ],
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }
    appointmentController.rejectAppointment(req, res, next);
  }
);

// PUT /api/appointments/:id/reschedule (Reschedule)
router.put(
  '/:id/reschedule',
  [
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('newDate').isISO8601().withMessage('Valid new date is required'),
    body('newTime').notEmpty().withMessage('New time is required')
  ],
  appointmentController.rescheduleAppointment
);

// DELETE /api/appointments/:id (Delete)
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid appointment ID')],
  appointmentController.deleteAppointment
);

module.exports = router;