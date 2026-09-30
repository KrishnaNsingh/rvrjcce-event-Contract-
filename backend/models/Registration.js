import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import url from 'node:url';
import { getEventDetails } from '../config/eventSchedule.js';
import { getNextSequence } from './Counter.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localDataFile = path.resolve(__dirname, '../data/registrations.json');
const rootDataFile = path.resolve(__dirname, '../../data/registrations.json');
const DATA_FILE = fs.existsSync(localDataFile) ? localDataFile : rootDataFile;

const teammateSchema = new mongoose.Schema({
  memberNumber: { type: Number, default: 1 },
  name: { type: String, default: 'Participant', trim: true },
  rollNo: { type: String, default: 'N/A', trim: true },
  phone: { type: String, default: 'N/A', trim: true },
  college: { type: String, default: '', trim: true }
}, { _id: false });

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  participantName: {
    type: String,
    required: [true, 'Participant Full Name is required'],
    trim: true
  },
  studentId: {
    type: String,
    trim: true,
    default: 'N/A'
  },
  department: {
    type: String,
    trim: true,
    default: 'Computer Science (CSE)'
  },
  year: {
    type: String,
    trim: true,
    default: '2nd Year'
  },
  gender: {
    type: String,
    trim: true,
    default: 'Male'
  },
  college: {
    type: String,
    required: [true, 'College or Institution is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Valid email is required'],
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true
  },
  registrationType: {
    type: String,
    default: 'Individual Participation'
  },
  venue: {
    type: String,
    default: 'RVRJC Campus Arena'
  },
  schedule: {
    type: String,
    default: '2026-02-26 (10:00)'
  },
  teamName: {
    type: String,
    trim: true,
    default: ''
  },
  teammates: [teammateSchema],
  attended: {
    type: Boolean,
    default: false
  },
  attendedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending Review', 'Waitlisted', 'Cancelled'],
    default: 'Confirmed'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const MongooseRegistration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

/**
 * Universal Data Access Object:
 * Automatically uses MongoDB Atlas if connected, or gracefully falls back to local JSON store.
 */
class RegistrationService {
  constructor() {
    this._initLocalStore();
  }

  _isMongo() {
    return mongoose.connection.readyState === 1;
  }

  _initLocalStore() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(DATA_FILE)) {
        // Pre-seed matching the user's reference PDF formats (CD26000001, CD26000004)
        const initialSeed = [
          {
            _id: "66f500000000000000000001",
            registrationId: "CD26000001",
            participantName: "Ananya Krishnamurthy",
            studentId: "SVEC22CS043",
            department: "Computer Science (CSE)",
            year: "2nd Year",
            gender: "Female",
            college: "SV Engineering College",
            email: "ananya.k@svec.edu.in",
            phoneNumber: "9876543210",
            category: "Literary & Cultural",
            division: "Cultural / Open",
            event: "Classical / Folk Solo",
            registrationType: "Individual Participation",
            venue: "RVRJC Open Air Theatre (OAT)",
            schedule: "2026-02-26 (15:00)",
            teamName: "",
            teammates: [],
            attended: true,
            attendedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "Confirmed",
            registrationDate: new Date("2026-09-23T00:22:00.000Z").toISOString()
          },
          {
            _id: "66f500000000000000000002",
            registrationId: "CD26000002",
            participantName: "K. Siddhartha Reddy",
            studentId: "Y22CS894",
            department: "Computer Science (CSE)",
            year: "3rd Year",
            gender: "Male",
            college: "RVR & JC College of Engineering",
            email: "siddhartha.k@rvrjcce.ac.in",
            phoneNumber: "9848022331",
            category: "Sports",
            division: "Boys",
            event: "Basketball",
            registrationType: "Team Participation",
            venue: "RVRJC Hardcourt Arena 1",
            schedule: "2026-02-26 (09:00)",
            teamName: "RVR Thunder",
            teammates: [
              { memberNumber: 1, name: "K. Siddhartha Reddy", rollNo: "Y22CS894", phone: "9848022331", college: "RVR & JC College of Engineering" },
              { memberNumber: 2, name: "V. Rakesh Varma", rollNo: "Y22CS895", phone: "9848022332", college: "RVR & JC College of Engineering" },
              { memberNumber: 3, name: "B. Pavan Kumar", rollNo: "Y22EC102", phone: "9848022333", college: "RVR & JC College of Engineering" },
              { memberNumber: 4, name: "M. Tarun", rollNo: "Y22ME044", phone: "9848022334", college: "RVR & JC College of Engineering" },
              { memberNumber: 5, name: "D. Akhil", rollNo: "Y22CE019", phone: "9848022335", college: "RVR & JC College of Engineering" }
            ],
            attended: false,
            attendedAt: null,
            status: "Confirmed",
            registrationDate: new Date("2026-09-24T10:15:00.000Z").toISOString()
          },
          {
            _id: "66f500000000000000000003",
            registrationId: "CD26000003",
            participantName: "B. Harshitha",
            studentId: "VF22CS089",
            department: "Information Technology (IT)",
            year: "3rd Year",
            gender: "Female",
            college: "Vignan's Foundation for Science, Tech & Research",
            email: "harshitha.b@vignan.ac.in",
            phoneNumber: "9440187654",
            category: "Sports",
            division: "Girls",
            event: "Throwball",
            registrationType: "Team Participation",
            venue: "RVRJC Standard Throwball Court",
            schedule: "2026-02-26 (09:30)",
            teamName: "Strikers VII",
            teammates: [
              { memberNumber: 1, name: "B. Harshitha", rollNo: "VF22CS089", phone: "9440187654", college: "Vignan's University" },
              { memberNumber: 2, name: "G. Keerthi", rollNo: "VF22CS090", phone: "9440187655", college: "Vignan's University" },
              { memberNumber: 3, name: "S. Priya", rollNo: "VF22EC012", phone: "9440187656", college: "Vignan's University" },
              { memberNumber: 4, name: "T. Bhavana", rollNo: "VF22IT044", phone: "9440187657", college: "Vignan's University" },
              { memberNumber: 5, name: "K. Sneha", rollNo: "VF22CS110", phone: "9440187658", college: "Vignan's University" },
              { memberNumber: 6, name: "N. Deepthi", rollNo: "VF22ME009", phone: "9440187659", college: "Vignan's University" },
              { memberNumber: 7, name: "R. Kavitha", rollNo: "VF22CE022", phone: "9440187660", college: "Vignan's University" }
            ],
            attended: true,
            attendedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            status: "Confirmed",
            registrationDate: new Date("2026-09-24T14:30:00.000Z").toISOString()
          },
          {
            _id: "66f500000000000000000004",
            registrationId: "CD26000004",
            participantName: "Karthik Reddy",
            studentId: "VRS22ME008",
            department: "Mechanical Engineering",
            year: "3rd Year",
            gender: "Male",
            college: "VR Siddhartha Engineering College",
            email: "karthik.r@vrsiddhartha.ac.in",
            phoneNumber: "9876543213",
            category: "Literary & Cultural",
            division: "Cultural / Open",
            event: "Western Group Dance",
            registrationType: "Team Participation",
            venue: "RVRJC Open Air Theatre (OAT)",
            schedule: "2026-02-26 (18:00)",
            teamName: "Rhythm Fusion Crew",
            teammates: [
              { memberNumber: 1, name: "Karthik Reddy", rollNo: "VRS22ME008", phone: "9876543213", college: "VR Siddhartha Engineering Coll.." },
              { memberNumber: 2, name: "Sravani Patel", rollNo: "VRS22CSE021", phone: "9876543220", college: "VR Siddhartha Engineering Coll.." },
              { memberNumber: 3, name: "Aditya Sharma", rollNo: "VRS22EEE034", phone: "9876543221", college: "VR Siddhartha Engineering Coll.." },
              { memberNumber: 4, name: "Mounika Rao", rollNo: "VRS23IT055", phone: "9876543222", college: "VR Siddhartha Engineering Coll.." },
              { memberNumber: 5, name: "Vinay Kumar", rollNo: "VRS22CSE077", phone: "9876543223", college: "VR Siddhartha Engineering Coll.." }
            ],
            attended: false,
            attendedAt: null,
            status: "Confirmed",
            registrationDate: new Date("2026-09-24T18:22:00.000Z").toISOString()
          }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[Registration Local Store Init Error]:', err);
    }
  }

  _readLocal() {
    try {
      this._initLocalStore();
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      return [];
    }
  }

  _writeLocal(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  _getNextLocalRegistrationId(docs) {
    let maxNum = 0;
    for (const d of docs) {
      if (d.registrationId && d.registrationId.startsWith('CD26')) {
        const numPart = parseInt(d.registrationId.slice(4), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `CD26${String(nextNum).padStart(6, '0')}`;
  }

  async find(query = {}) {
    if (this._isMongo()) {
      const filter = {};
      if (query.category && query.category !== 'all') filter.category = new RegExp(`^${query.category}$`, 'i');
      if (query.division && query.division !== 'all') filter.division = new RegExp(`^${query.division}$`, 'i');
      if (query.event && query.event !== 'all') filter.event = new RegExp(`^${query.event}$`, 'i');
      if (query.attended !== undefined && query.attended !== 'all') {
        filter.attended = query.attended === 'true' || query.attended === true;
      }
      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [
          { participantName: regex },
          { studentId: regex },
          { college: regex },
          { teamName: regex },
          { email: regex },
          { phoneNumber: regex },
          { event: regex },
          { registrationId: regex }
        ];
      }
      return await MongooseRegistration.find(filter).sort({ registrationDate: -1 }).lean();
    }

    // Local fallback
    let docs = this._readLocal();
    if (query.category && query.category !== 'all') {
      docs = docs.filter(d => d.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.division && query.division !== 'all') {
      docs = docs.filter(d => d.division.toLowerCase() === query.division.toLowerCase());
    }
    if (query.event && query.event !== 'all') {
      docs = docs.filter(d => d.event.toLowerCase() === query.event.toLowerCase());
    }
    if (query.attended !== undefined && query.attended !== 'all') {
      const wantAttended = query.attended === 'true' || query.attended === true;
      docs = docs.filter(d => Boolean(d.attended) === wantAttended);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      docs = docs.filter(d =>
        (d.participantName && d.participantName.toLowerCase().includes(q)) ||
        (d.studentId && d.studentId.toLowerCase().includes(q)) ||
        (d.college && d.college.toLowerCase().includes(q)) ||
        (d.teamName && d.teamName.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.phoneNumber && d.phoneNumber.includes(q)) ||
        (d.event && d.event.toLowerCase().includes(q)) ||
        (d.registrationId && d.registrationId.toLowerCase().includes(q))
      );
    }
    docs.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    return docs;
  }

  async findById(id) {
    if (this._isMongo()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await MongooseRegistration.findById(id).lean();
        if (doc) return doc;
      }
      return await MongooseRegistration.findOne({ registrationId: id }).lean();
    }

    const docs = this._readLocal();
    return docs.find(d => d._id === id || d.registrationId === id) || null;
  }

  async create(data) {
    const eventInfo = getEventDetails(data.event);

    // Format registration ID
    let registrationId = data.registrationId;
    if (!registrationId) {
      if (this._isMongo()) {
        registrationId = await getNextSequence('registrationId');
      } else {
        const docs = this._readLocal();
        registrationId = this._getNextLocalRegistrationId(docs);
      }
    }

    // Determine registration type and teammates
    const isTeamEvent = Boolean(eventInfo.isTeam || (data.registrationType === 'Team Participation'));
    const registrationType = isTeamEvent ? 'Team Participation' : 'Individual Participation';

    // Format teammates
    let teammatesList = [];
    if (isTeamEvent) {
      if (Array.isArray(data.teammates) && data.teammates.length > 0) {
        // Filter out empty rows where name is blank or missing
        const validMembers = data.teammates.filter(m => m && typeof m.name === 'string' && m.name.trim().length > 0);
        if (validMembers.length > 0) {
          teammatesList = validMembers.map((m, idx) => ({
            memberNumber: idx + 1,
            name: m.name.trim(),
            rollNo: (m.rollNo && String(m.rollNo).trim()) || 'N/A',
            phone: (m.phone && String(m.phone).trim()) || 'N/A',
            college: (m.college && String(m.college).trim()) || data.college.trim()
          }));
        }
      }
      // If team event but no teammates provided/valid, ensure at least captain:
      if (teammatesList.length === 0) {
        teammatesList = [{
          memberNumber: 1,
          name: data.participantName.trim(),
          rollNo: (data.studentId && String(data.studentId).trim()) || 'N/A',
          phone: (data.phoneNumber && String(data.phoneNumber).trim()) || 'N/A',
          college: data.college.trim()
        }];
      }
    } else {
      // Individual event: teammates is ALWAYS strictly empty array
      teammatesList = [];
    }

    const docData = {
      registrationId,
      participantName: data.participantName.trim(),
      studentId: data.studentId ? String(data.studentId).trim() : 'N/A',
      department: data.department ? String(data.department).trim() : 'General',
      year: data.year || '2nd Year',
      gender: data.gender || 'Male',
      college: data.college.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNumber: String(data.phoneNumber).trim(),
      category: data.category,
      division: data.category === 'Sports' ? (data.division || 'Boys') : 'Cultural / Open',
      event: data.event.trim(),
      registrationType,
      venue: data.venue || eventInfo.venue || 'RVRJC Campus Arena',
      schedule: data.schedule || eventInfo.schedule || '2026-02-26 (10:00)',
      teamName: isTeamEvent ? (data.teamName ? String(data.teamName).trim() : `${data.participantName.trim()}'s Squad`) : '',
      teammates: teammatesList,
      attended: Boolean(data.attended),
      attendedAt: data.attended ? new Date() : null,
      status: data.status || 'Confirmed',
      registrationDate: data.registrationDate ? new Date(data.registrationDate) : new Date(),
      notes: data.notes || ''
    };

    if (this._isMongo()) {
      const created = await MongooseRegistration.create(docData);
      return created.toObject();
    }

    // Local JSON store
    const docs = this._readLocal();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      ...docData,
      registrationDate: docData.registrationDate.toISOString(),
      attendedAt: docData.attendedAt ? docData.attendedAt.toISOString() : null
    };
    docs.unshift(newDoc);
    this._writeLocal(docs);
    return newDoc;
  }

  async findByIdAndUpdate(id, updates) {
    if (this._isMongo()) {
      let filter = { registrationId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        filter = { $or: [{ _id: id }, { registrationId: id }] };
      }
      return await MongooseRegistration.findOneAndUpdate(filter, updates, { returnDocument: 'after' }).lean();
    }

    const docs = this._readLocal();
    const index = docs.findIndex(d => d._id === id || d.registrationId === id);
    if (index === -1) return null;

    const existing = docs[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (updates.attended !== undefined && updates.attended !== existing.attended) {
      updated.attended = Boolean(updates.attended);
      updated.attendedAt = updated.attended ? new Date().toISOString() : null;
    }
    docs[index] = updated;
    this._writeLocal(docs);
    return updated;
  }

  async toggleAttendance(id, attendedStatus) {
    const isAttended = attendedStatus !== undefined ? Boolean(attendedStatus) : null;

    if (this._isMongo()) {
      let filter = { registrationId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        filter = { $or: [{ _id: id }, { registrationId: id }] };
      }
      const existing = await MongooseRegistration.findOne(filter);
      if (!existing) return null;

      const newAttended = isAttended !== null ? isAttended : !existing.attended;
      existing.attended = newAttended;
      existing.attendedAt = newAttended ? new Date() : null;
      await existing.save();
      return existing.toObject();
    }

    const docs = this._readLocal();
    const index = docs.findIndex(d => d._id === id || d.registrationId === id);
    if (index === -1) return null;

    const current = docs[index];
    const newAttended = isAttended !== null ? isAttended : !Boolean(current.attended);
    current.attended = newAttended;
    current.attendedAt = newAttended ? new Date().toISOString() : null;
    docs[index] = current;
    this._writeLocal(docs);
    return current;
  }

  async findByIdAndDelete(id) {
    if (this._isMongo()) {
      let filter = { registrationId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        filter = { $or: [{ _id: id }, { registrationId: id }] };
      }
      return await MongooseRegistration.findOneAndDelete(filter).lean();
    }

    const docs = this._readLocal();
    const index = docs.findIndex(d => d._id === id || d.registrationId === id);
    if (index === -1) return null;
    const removed = docs.splice(index, 1)[0];
    this._writeLocal(docs);
    return removed;
  }

  async getStats() {
    const all = await this.find({});
    const total = all.length;
    const sports = all.filter(d => d.category === 'Sports').length;
    const cultural = all.filter(d => d.category === 'Literary & Cultural').length;
    const boys = all.filter(d => d.division === 'Boys').length;
    const girls = all.filter(d => d.division === 'Girls').length;
    const attended = all.filter(d => Boolean(d.attended)).length;
    const pendingAttendance = total - attended;
    const colleges = new Set(all.map(d => (d.college || '').toLowerCase().trim())).size;

    return {
      total,
      sports,
      cultural,
      boys,
      girls,
      attended,
      pendingAttendance,
      colleges
    };
  }
}

export const Registration = new RegistrationService();
