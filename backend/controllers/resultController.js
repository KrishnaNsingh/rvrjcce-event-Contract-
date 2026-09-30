import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import mongoose from 'mongoose';
import Result from '../models/Result.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_DATA_FILE = path.resolve(__dirname, '../data/results.json');
const FACULTY_DATA_FILE = path.resolve(__dirname, '../data/faculty.json');

function readLocalResults() {
  try {
    if (fs.existsSync(RESULTS_DATA_FILE)) {
      const raw = fs.readFileSync(RESULTS_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local results file:', err);
  }
  return [];
}

function writeLocalResults(data) {
  try {
    const dir = path.dirname(RESULTS_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RESULTS_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local results file:', err);
  }
}

function readLocalFaculty() {
  try {
    if (fs.existsSync(FACULTY_DATA_FILE)) {
      const raw = fs.readFileSync(FACULTY_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local faculty file:', err);
  }
  return [];
}

export async function getResults(req, res) {
  try {
    const { category, division, event, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (division && division !== 'all') query.division = division;
      if (event && event !== 'all') query.event = event;
      if (search) {
        query.$or = [
          { participantName: { $regex: search, $options: 'i' } },
          { teamName: { $regex: search, $options: 'i' } },
          { college: { $regex: search, $options: 'i' } },
          { event: { $regex: search, $options: 'i' } },
          { certificateId: { $regex: search, $options: 'i' } }
        ];
      }

      const items = await Result.find(query).sort({ createdAt: -1 });
      if (items && items.length > 0) {
        return res.status(200).json({ success: true, count: items.length, results: items });
      }
    }

    // Fallback to local JSON persistence
    let local = readLocalResults();
    if (category && category !== 'all') local = local.filter(r => r.category === category);
    if (division && division !== 'all') local = local.filter(r => r.division === division);
    if (event && event !== 'all') local = local.filter(r => r.event === event);
    if (search) {
      const s = search.toLowerCase();
      local = local.filter(r =>
        (r.participantName && r.participantName.toLowerCase().includes(s)) ||
        (r.teamName && r.teamName.toLowerCase().includes(s)) ||
        (r.college && r.college.toLowerCase().includes(s)) ||
        (r.event && r.event.toLowerCase().includes(s)) ||
        (r.certificateId && r.certificateId.toLowerCase().includes(s))
      );
    }

    return res.status(200).json({
      success: true,
      count: local.length,
      results: local,
      mode: 'Local File Persistence'
    });
  } catch (err) {
    console.error('getResults error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve results' });
  }
}

export async function createResult(req, res) {
  try {
    const {
      event,
      category,
      division,
      position,
      winnerType,
      teamName,
      participantName,
      teammates,
      college,
      department,
      scoreOrRound,
      dateAnnounced
    } = req.body;

    if (!event || !participantName || !college) {
      return res.status(400).json({ success: false, error: 'Event, winner name, and college are required' });
    }

    const certPrefix = (event.replace(/[^A-Za-z]/g, '').substring(0, 3) || 'WIN').toUpperCase();
    const certificateId = `CERT-CD26-${certPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      certificateId,
      event,
      category: category || 'Sports',
      division: division || 'Boys',
      position: position || '1st Place - Winner (Gold)',
      winnerType: winnerType || 'Team',
      teamName: teamName || '',
      participantName,
      teammates: Array.isArray(teammates) ? teammates : (teammates ? [teammates] : []),
      college,
      department: department || '',
      scoreOrRound: scoreOrRound || '',
      dateAnnounced: dateAnnounced || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Official'
    };

    let savedItem = null;

    if (mongoose.connection.readyState === 1) {
      const doc = new Result(payload);
      savedItem = await doc.save();
    }

    const local = readLocalResults();
    const newEntry = savedItem ? savedItem.toObject() : {
      ...payload,
      id: `RES-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    local.unshift(newEntry);
    writeLocalResults(local);

    return res.status(201).json({
      success: true,
      message: 'Tournament result published successfully',
      result: newEntry
    });
  } catch (err) {
    console.error('createResult error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to publish result' });
  }
}

export async function updateResult(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updatedItem = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      updatedItem = await Result.findByIdAndUpdate(id, updates, { new: true });
    }

    const local = readLocalResults();
    const idx = local.findIndex(r => (r._id && r._id.toString() === id) || r.id === id || r.certificateId === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      writeLocalResults(local);
      if (!updatedItem) updatedItem = local[idx];
    }

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Result record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      result: updatedItem
    });
  } catch (err) {
    console.error('updateResult error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update result' });
  }
}

export async function deleteResult(req, res) {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Result.findByIdAndDelete(id);
    }

    const local = readLocalResults();
    const filtered = local.filter(r => (r._id && r._id.toString() !== id) && r.id !== id && r.certificateId !== id);
    writeLocalResults(filtered);

    return res.status(200).json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (err) {
    console.error('deleteResult error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete result' });
  }
}

export function getFaculty(req, res) {
  const faculty = readLocalFaculty();
  return res.status(200).json({
    success: true,
    count: faculty.length,
    faculty
  });
}
