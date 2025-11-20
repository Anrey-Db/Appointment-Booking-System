const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    // Optional: Filter by role if query param is provided (e.g., ?role=staff)
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password'); // Exclude passwords from response
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated', user });
  } catch (error) {
    next(error);
  }
};