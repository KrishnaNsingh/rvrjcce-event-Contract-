import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Schedule Update', 'Venue Alert', 'Important Notice', 'Prize Ceremony', 'Weather Notice', 'General'],
    default: 'Important Notice'
  },
  priority: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal'
  },
  date: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  venue: {
    type: String,
    default: ''
  },
  instructions: {
    type: [String],
    default: []
  },
  coordinator: {
    name: { type: String, default: '' },
    contact: { type: String, default: '' }
  },
  pinned: {
    type: Boolean,
    default: false
  },
  attachmentUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

announcementSchema.index({ pinned: -1, createdAt: -1 });

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
