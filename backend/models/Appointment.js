const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // References the 'users' collection
    required: true 
  },
  date: { 
    type: Date, 
    required: true  // e.g., new Date('2023-10-15')
  },
  time: { 
    type: String, 
    required: true  // e.g., "10:00 AM" or "10:00 AM - 10:30 AM" (standardize for consistency)
  },
  purpose: { 
    type: String, 
    required: true  // e.g., "Consultation" or "Meeting"
  },
  preferredStaff: { 
    type: String  // Optional: Staff name (e.g., "Dr. Smith") or ObjectId if you add a staff collection
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  remarks: { 
    type: String  // Optional: Admin/staff notes on approval/rejection
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes for performance:
// - Compound index on date, time, and status for fast conflict checks (e.g., prevent double-booking approved slots)
appointmentSchema.index({ date: 1, time: 1, status: 1 });

// - Index on userId for quick user-specific appointment queries
appointmentSchema.index({ userId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);