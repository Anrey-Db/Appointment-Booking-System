const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.createAppointment = async (req, res, next) => {
  try {
    const { date, time, purpose, preferredStaff } = req.body;
    const userId = req.user.id; // From authMiddleware (JWT payload)

    console.log('[createAppointment] Request:', { userId, date, time, purpose, preferredStaff });

    // Check for conflicts: No approved appointment on the same date/time
    const conflict = await Appointment.findOne({ date, time, status: 'approved' });
    if (conflict) {
      console.log('[createAppointment] Conflict found:', conflict);
      return res.status(409).json({ message: 'Time slot already booked' });
    }

    const appointment = new Appointment({ userId, date, time, purpose, preferredStaff });
    await appointment.save();

    console.log('[createAppointment] Appointment saved:', appointment);
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('[createAppointment] Error:', error);
    next(error);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { userId, status, date } = req.query;
    const filter = {};

    // Admins/staff can see all; users see only their own
    if (req.user.role === 'user') {
      filter.userId = req.user.id;
    } else if (userId) {
      filter.userId = userId;
    }

    if (status) filter.status = status;
    if (date) {
      // Parse date range (e.g., 2025-11-25)
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    console.log('[getAppointments] Filter:', filter);
    const appointments = await Appointment.find(filter).populate('userId', 'firstName lastName email');
    console.log('[getAppointments] Found:', appointments.length, 'appointments');
    res.json(appointments);
  } catch (error) {
    console.error('[getAppointments] Error:', error);
    next(error);
  }
};

exports.approveAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    console.log('[approveAppointment] ID:', id, 'Remarks:', remarks);

    const appointment = await Appointment.findByIdAndUpdate(id, { status: 'approved', remarks }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('[approveAppointment] Approved:', appointment);
    res.json({ message: 'Appointment approved', appointment });
  } catch (error) {
    console.error('[approveAppointment] Error:', error);
    next(error);
  }
};

exports.rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    console.log('[rejectAppointment] ID:', id, 'Remarks:', remarks);

    const appointment = await Appointment.findByIdAndUpdate(id, { status: 'rejected', remarks }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('[rejectAppointment] Rejected:', appointment);
    res.json({ message: 'Appointment rejected', appointment });
  } catch (error) {
    console.error('[rejectAppointment] Error:', error);
    next(error);
  }
};

exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;

    // Check for conflicts on new date/time
    const conflict = await Appointment.findOne({ date: newDate, time: newTime, status: 'approved' });
    if (conflict) {
      return res.status(409).json({ message: 'New time slot already booked' });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, { date: newDate, time: newTime, status: 'pending' }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment rescheduled', appointment });
  } catch (error) {
    next(error);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    next(error);
  }
};