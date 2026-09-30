import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/announcements.json');

function readLocalAnnouncements() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local announcements file:', err);
  }
  return [];
}

function writeLocalAnnouncements(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local announcements file:', err);
  }
}

export async function getAnnouncements(req, res) {
  try {
    const { category, priority, pinned } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (priority && priority !== 'all') query.priority = priority;
      if (pinned !== undefined && pinned !== 'all') query.pinned = pinned === 'true';

      const items = await Announcement.find(query).sort({ pinned: -1, createdAt: -1 });
      if (items && items.length > 0) {
        return res.status(200).json({ success: true, count: items.length, announcements: items });
      }
    }

    // Fallback to local JSON persistence
    let local = readLocalAnnouncements();
    if (category && category !== 'all') local = local.filter(a => a.category === category);
    if (priority && priority !== 'all') local = local.filter(a => a.priority === priority);
    if (pinned !== undefined && pinned !== 'all') local = local.filter(a => String(a.pinned) === pinned);

    return res.status(200).json({
      success: true,
      count: local.length,
      announcements: local,
      mode: 'Local File Persistence'
    });
  } catch (err) {
    console.error('getAnnouncements error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve announcements' });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { title, category, priority, date, content, imageUrl, venue, instructions, coordinator, pinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const payload = {
      title,
      category: category || 'Important Notice',
      priority: priority || 'Normal',
      date: date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      content,
      imageUrl: imageUrl || '',
      venue: venue || '',
      instructions: Array.isArray(instructions) ? instructions : (instructions ? [instructions] : []),
      coordinator: coordinator || { name: '', contact: '' },
      pinned: Boolean(pinned)
    };

    let savedItem = null;

    if (mongoose.connection.readyState === 1) {
      const doc = new Announcement(payload);
      savedItem = await doc.save();
    }

    // Update local JSON cache
    const local = readLocalAnnouncements();
    const newEntry = savedItem ? savedItem.toObject() : {
      ...payload,
      id: `ANN-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    local.unshift(newEntry);
    writeLocalAnnouncements(local);

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: newEntry
    });
  } catch (err) {
    console.error('createAnnouncement error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create announcement' });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updatedItem = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      updatedItem = await Announcement.findByIdAndUpdate(id, updates, { new: true });
    }

    const local = readLocalAnnouncements();
    const idx = local.findIndex(a => (a._id && a._id.toString() === id) || a.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      writeLocalAnnouncements(local);
      if (!updatedItem) updatedItem = local[idx];
    }

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: updatedItem
    });
  } catch (err) {
    console.error('updateAnnouncement error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update announcement' });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Announcement.findByIdAndDelete(id);
    }

    const local = readLocalAnnouncements();
    const filtered = local.filter(a => (a._id && a._id.toString() !== id) && a.id !== id);
    writeLocalAnnouncements(filtered);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (err) {
    console.error('deleteAnnouncement error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete announcement' });
  }
}
