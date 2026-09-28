/**
 * MongoDB Registration Schema & Model
 * Strict institutional schema specification for university event registrations.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Mongoose-style Schema Definition for Documentation and ODM binding
export const RegistrationSchemaDefinition = {
  registrationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: "Institutional registration identifier, e.g., RVR-2026-8492"
  },
  participantName: {
    type: String,
    required: [true, "Participant or Primary Representative Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  teamName: {
    type: String,
    trim: true,
    default: "Individual Entry"
  },
  college: {
    type: String,
    required: [true, "College or Institution Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Valid email address is required"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid institutional or personal email address"]
  },
  phoneNumber: {
    type: String,
    required: [true, "Contact phone number is required"],
    trim: true,
    match: [/^[0-9+ -]{10,15}$/, "Please provide a valid 10-digit phone number"]
  },
  category: {
    type: String,
    required: [true, "Category selection is required"],
    enum: ["Sports", "Literary & Cultural"]
  },
  division: {
    type: String,
    required: [true, "Division selection is required"],
    enum: ["Boys", "Girls", "Cultural / Open"]
  },
  event: {
    type: String,
    required: [true, "Specific competition event must be selected"],
    trim: true
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending Review", "Waitlisted"],
    default: "Confirmed"
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
};

const DATA_FILE = path.join(process.cwd(), 'data', 'registrations.json');

// Persistent storage engine mimicking MongoDB Collection operations
class RegistrationModel {
  constructor() {
    this._initStore();
  }

  _initStore() {
    try {
      if (!fs.existsSync(path.dirname(DATA_FILE))) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      }
      if (!fs.existsSync(DATA_FILE)) {
        // Seed initial high-quality records representing diverse colleges
        const initialSeed = [
          {
            _id: "66f500010000000000000001",
            registrationId: "RVR-2026-1042",
            participantName: "K. Siddhartha Reddy",
            teamName: "RVR Thunder",
            college: "RVR & JC College of Engineering",
            email: "siddhartha.k@rvrjcce.ac.in",
            phoneNumber: "9848022331",
            category: "Sports",
            division: "Boys",
            event: "Basketball",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 48).toISOString()
          },
          {
            _id: "66f500020000000000000002",
            registrationId: "RVR-2026-1088",
            participantName: "B. Harshitha",
            teamName: "Strikers VII",
            college: "Vignan's Foundation for Science, Tech & Research",
            email: "harshitha.b@vignan.ac.in",
            phoneNumber: "9440187654",
            category: "Sports",
            division: "Girls",
            event: "Throwball",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 36).toISOString()
          },
          {
            _id: "66f500030000000000000003",
            registrationId: "RVR-2026-2104",
            participantName: "V. Sai Praneeth",
            teamName: "Acoustic Mirage",
            college: "Andhra University College of Engineering",
            email: "praneeth.music@andhrauniv.edu.in",
            phoneNumber: "8919245671",
            category: "Literary & Cultural",
            division: "Cultural / Open",
            event: "Music & Band — Group",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 24).toISOString()
          },
          {
            _id: "66f500040000000000000004",
            registrationId: "RVR-2026-2155",
            participantName: "M. Ananya Rao",
            teamName: "Nritya Tarang",
            college: "KL Deemed to be University",
            email: "ananya.rao@kluniversity.in",
            phoneNumber: "9121884321",
            category: "Literary & Cultural",
            division: "Cultural / Open",
            event: "Dance — Solo",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 18).toISOString()
          },
          {
            _id: "66f500050000000000000005",
            registrationId: "RVR-2026-1219",
            participantName: "N. Akhil Kumar",
            teamName: "Individual Entry",
            college: "Bapatla Engineering College",
            email: "akhil.n@becbapatla.ac.in",
            phoneNumber: "9885123450",
            category: "Sports",
            division: "Boys",
            event: "Table Tennis",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 12).toISOString()
          },
          {
            _id: "66f500060000000000000006",
            registrationId: "RVR-2026-3021",
            participantName: "T. Swathi Krishna",
            teamName: "RVR Natya Troupe",
            college: "RVR & JC College of Engineering",
            email: "swathi.k@rvrjcce.ac.in",
            phoneNumber: "9701345678",
            category: "Literary & Cultural",
            division: "Cultural / Open",
            event: "Choreoday — Theme Based",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 6).toISOString()
          },
          {
            _id: "66f500070000000000000007",
            registrationId: "RVR-2026-1304",
            participantName: "P. Rithvika",
            teamName: "Smash Aces",
            college: "GMR Institute of Technology",
            email: "rithvika.p@gmrit.edu.in",
            phoneNumber: "9490123987",
            category: "Sports",
            division: "Girls",
            event: "Tennis",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 3).toISOString()
          },
          {
            _id: "66f500080000000000000008",
            registrationId: "RVR-2026-4015",
            participantName: "D. Charantej",
            teamName: "Individual Entry",
            college: "JNTU College of Engineering Kakinada",
            email: "charantej@jntucek.ac.in",
            phoneNumber: "9951678901",
            category: "Literary & Cultural",
            division: "Cultural / Open",
            event: "Literary",
            status: "Confirmed",
            registrationDate: new Date(Date.now() - 3600000 * 1).toISOString()
          }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error("Error initializing registration store:", err);
    }
  }

  _read() {
    try {
      this._initStore();
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  validate(data) {
    const errors = [];
    if (!data.participantName || data.participantName.trim().length < 2) {
      errors.push("Participant Name is required (minimum 2 characters)");
    }
    if (!data.college || data.college.trim().length < 2) {
      errors.push("College / Institution Name is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      errors.push("A valid email address is required");
    }
    const phoneClean = (data.phoneNumber || "").replace(/[^0-9]/g, "");
    if (!phoneClean || phoneClean.length < 10) {
      errors.push("A valid 10-digit phone number is required");
    }
    if (!data.category || !["Sports", "Literary & Cultural"].includes(data.category)) {
      errors.push("Valid category (Sports or Literary & Cultural) is required");
    }
    if (data.category === "Sports") {
      if (!data.division || !["Boys", "Girls"].includes(data.division)) {
        errors.push("Sports registrations must select either Boys or Girls division");
      }
    }
    if (!data.event || data.event.trim().length < 2) {
      errors.push("Event selection is required");
    }
    return errors;
  }

  async find(query = {}) {
    let docs = this._read();
    if (query.category) {
      docs = docs.filter(d => d.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.division) {
      docs = docs.filter(d => d.division.toLowerCase() === query.division.toLowerCase());
    }
    if (query.event) {
      docs = docs.filter(d => d.event.toLowerCase() === query.event.toLowerCase());
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      docs = docs.filter(d =>
        (d.participantName && d.participantName.toLowerCase().includes(q)) ||
        (d.college && d.college.toLowerCase().includes(q)) ||
        (d.teamName && d.teamName.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.event && d.event.toLowerCase().includes(q)) ||
        (d.registrationId && d.registrationId.toLowerCase().includes(q))
      );
    }
    // Default sort latest first
    docs.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    return docs;
  }

  async findById(id) {
    const docs = this._read();
    return docs.find(d => d._id === id || d.registrationId === id) || null;
  }

  async create(data) {
    const validationErrors = this.validate(data);
    if (validationErrors.length > 0) {
      const err = new Error(validationErrors.join("; "));
      err.validationErrors = validationErrors;
      throw err;
    }

    const docs = this._read();
    const idHex = crypto.randomBytes(12).toString('hex');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const registrationId = `RVR-2026-${randomSuffix}`;

    const newDoc = {
      _id: idHex,
      registrationId,
      participantName: data.participantName.trim(),
      teamName: data.teamName && data.teamName.trim() ? data.teamName.trim() : "Individual Entry",
      college: data.college.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNumber: data.phoneNumber.trim(),
      category: data.category,
      division: data.category === "Sports" ? data.division : "Cultural / Open",
      event: data.event.trim(),
      status: "Confirmed",
      registrationDate: new Date().toISOString()
    };

    docs.unshift(newDoc);
    this._write(docs);
    return newDoc;
  }

  async findByIdAndDelete(id) {
    const docs = this._read();
    const index = docs.findIndex(d => d._id === id || d.registrationId === id);
    if (index === -1) return null;
    const removed = docs.splice(index, 1)[0];
    this._write(docs);
    return removed;
  }

  async getStats() {
    const docs = this._read();
    const total = docs.length;
    const sports = docs.filter(d => d.category === "Sports").length;
    const cultural = docs.filter(d => d.category === "Literary & Cultural").length;
    const boys = docs.filter(d => d.division === "Boys").length;
    const girls = docs.filter(d => d.division === "Girls").length;

    // Unique colleges count
    const colleges = new Set(docs.map(d => d.college.toLowerCase().trim())).size;

    return {
      total,
      sports,
      cultural,
      boys,
      girls,
      colleges
    };
  }
}

export const Registration = new RegistrationModel();
