import { Registration } from '../models/Registration.js';
import { getEventDetails } from '../config/eventSchedule.js';
import { buildRegistrationPDF } from '../utils/pdfGenerator.js';
import { getDbStatus } from '../config/db.js';

export async function getRegistrations(req, res) {
  try {
    const { category, division, event, attended, search } = req.query;
    const registrations = await Registration.find({ category, division, event, attended, search });
    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
      dbStatus: getDbStatus()
    });
  } catch (err) {
    console.error('[API getRegistrations error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve registrations' });
  }
}

export async function getRegistrationById(req, res) {
  try {
    const { id } = req.params;
    const doc = await Registration.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    return res.status(200).json({ success: true, registration: doc });
  } catch (err) {
    console.error('[API getRegistrationById error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch registration details' });
  }
}

export async function createRegistration(req, res) {
  try {
    const data = req.body || {};

    if (!data.participantName || data.participantName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Participant full name is required (min 2 characters)' });
    }
    if (!data.college || data.college.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'College / Institution name is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }
    const cleanPhone = (data.phoneNumber || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required' });
    }
    if (!data.category) {
      return res.status(400).json({ success: false, error: 'Category selection is required' });
    }
    if (!data.event) {
      return res.status(400).json({ success: false, error: 'Event selection is required' });
    }

    const created = await Registration.create(data);

    return res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully.',
      registration: created
    });
  } catch (err) {
    console.error('[API createRegistration error]:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Registration processing failed'
    });
  }
}

export async function updateRegistration(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    // Check if event changed to update venue/schedule if not explicitly provided
    if (updates.event && (!updates.venue || !updates.schedule)) {
      const eventDetails = getEventDetails(updates.event);
      if (!updates.venue) updates.venue = eventDetails.venue;
      if (!updates.schedule) updates.schedule = eventDetails.schedule;
    }

    const updated = await Registration.findByIdAndUpdate(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Registration not found or could not be updated' });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration details updated successfully.',
      registration: updated
    });
  } catch (err) {
    console.error('[API updateRegistration error]:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to update registration' });
  }
}

export async function toggleAttendance(req, res) {
  try {
    const { id } = req.params;
    const { attended } = req.body || {};

    const updated = await Registration.toggleAttendance(id, attended);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Participant marked as ${updated.attended ? 'Attended' : 'Absent'}`,
      registration: updated
    });
  } catch (err) {
    console.error('[API toggleAttendance error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to update attendance status' });
  }
}

export async function deleteRegistration(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Registration.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Registration not found or already deleted' });
    }
    return res.status(200).json({
      success: true,
      message: 'Registration record removed successfully.',
      registration: deleted
    });
  } catch (err) {
    console.error('[API deleteRegistration error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete registration' });
  }
}

export async function getStats(req, res) {
  try {
    const stats = await Registration.getStats();
    return res.status(200).json({
      success: true,
      stats,
      dbStatus: getDbStatus()
    });
  } catch (err) {
    console.error('[API getStats error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to compute event statistics' });
  }
}

export async function exportCsv(req, res) {
  try {
    const registrations = await Registration.find(req.query);

    const headers = [
      "Registration ID",
      "Participant Name",
      "Student ID / Roll No",
      "Department",
      "Year",
      "Gender",
      "College / Institution",
      "Email",
      "Phone Number",
      "Category",
      "Division",
      "Event",
      "Registration Type",
      "Venue",
      "Schedule",
      "Team Name",
      "Team Size",
      "Team Members List",
      "Attended Status",
      "Attended Timestamp",
      "Status",
      "Registration Date"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const csvRows = [headers.join(",")];

    for (const r of registrations) {
      const teammatesStr = (r.teammates && r.teammates.length > 0)
        ? r.teammates.map(m => `${m.name} (${m.rollNo || 'N/A'}, ${m.phone || 'N/A'})`).join("; ")
        : "None";

      const teamSize = (r.teammates && r.teammates.length > 0) ? r.teammates.length : 1;

      const row = [
        escapeCsv(r.registrationId),
        escapeCsv(r.participantName),
        escapeCsv(r.studentId || 'N/A'),
        escapeCsv(r.department || 'N/A'),
        escapeCsv(r.year || 'N/A'),
        escapeCsv(r.gender || 'N/A'),
        escapeCsv(r.college),
        escapeCsv(r.email),
        escapeCsv(r.phoneNumber),
        escapeCsv(r.category),
        escapeCsv(r.division),
        escapeCsv(r.event),
        escapeCsv(r.registrationType || 'Individual Participation'),
        escapeCsv(r.venue || 'RVRJC Campus Arena'),
        escapeCsv(r.schedule || '2026-02-26'),
        escapeCsv(r.teamName || 'Individual Entry'),
        escapeCsv(teamSize),
        escapeCsv(teammatesStr),
        escapeCsv(r.attended ? 'Attended' : 'Not Attended'),
        escapeCsv(r.attendedAt ? new Date(r.attendedAt).toLocaleString() : 'N/A'),
        escapeCsv(r.status || 'Confirmed'),
        escapeCsv(r.registrationDate ? new Date(r.registrationDate).toLocaleString() : 'N/A')
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="COLORIDO_2K26_Registrations.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('[API exportCsv error]:', err);
    return res.status(500).json({ success: false, error: 'CSV generation failed' });
  }
}

export async function downloadPdf(req, res) {
  try {
    const { id } = req.params;
    const docData = await Registration.findById(id);
    if (!docData) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    const doc = buildRegistrationPDF(docData);
    const pdfOutput = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfOutput);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="COLORIDO_2K26_Pass_${docData.registrationId}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('[API downloadPdf error]:', err);
    return res.status(500).json({ success: false, error: 'PDF generation failed' });
  }
}
