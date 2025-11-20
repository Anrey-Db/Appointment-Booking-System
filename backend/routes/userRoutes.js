const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users (Admin/Staff only)
router.get('/', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Access denied' });
  }
  userController.getUsers(req, res, next);
});

// PUT /api/users/:id (Admin only)
router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  userController.updateUserRole(req, res, next);
});

module.exports = router;