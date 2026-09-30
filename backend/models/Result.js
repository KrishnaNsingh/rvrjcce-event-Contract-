import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sports', 'Literary & Cultural'],
    default: 'Sports'
  },
  division: {
    type: String,
    required: true,
    enum: ['Boys', 'Girls', 'Open'],
    default: 'Boys'
  },
  position: {
    type: String,
    required: true,
    enum: [
      '1st Place - Winner (Gold)',
      '2nd Place - Runner-Up (Silver)',
      '3rd Place - 2nd Runner-Up (Bronze)',
      'Special Jury Mention'
    ],
    default: '1st Place - Winner (Gold)'
  },
  winnerType: {
    type: String,
    enum: ['Individual', 'Team'],
    default: 'Team'
  },
  teamName: {
    type: String,
    default: ''
  },
  participantName: {
    type: String,
    required: true,
    trim: true
  },
  teammates: {
    type: [String],
    default: []
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    default: ''
  },
  scoreOrRound: {
    type: String,
    default: ''
  },
  dateAnnounced: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Official', 'Provisional'],
    default: 'Official'
  }
}, {
  timestamps: true
});

resultSchema.index({ event: 1, position: 1 });
resultSchema.index({ certificateId: 1 }, { unique: true });

export default mongoose.models.Result || mongoose.model('Result', resultSchema);
