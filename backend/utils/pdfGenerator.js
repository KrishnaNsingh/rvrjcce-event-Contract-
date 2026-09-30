import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an official, pixel-perfect COLORIDO 2K26 Registration E-Pass PDF
 * matches the institutional design of RVR & JC College of Engineering.
 */
export function buildRegistrationPDF(registration) {
  // A4 size in millimeters (210 x 297)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Outer Decorative Page Border
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2, 'S');

  // Top Header Box (Navy Blue with Orange Accent Stripe)
  const headerY = 14;
  const headerHeight = 25;
  const headerWidth = contentWidth - 8;
  const headerX = margin + 4;

  // Navy blue background
  doc.setFillColor(11, 22, 44); // #0B162C
  doc.rect(headerX, headerY, headerWidth, headerHeight, 'F');

  // Dual-tone accent stripe across the very top of the header
  doc.setFillColor(79, 70, 229); // Royal violet-blue
  doc.rect(headerX, headerY, headerWidth * 0.7, 1.2, 'F');
  doc.setFillColor(245, 158, 11); // Amber-gold
  doc.rect(headerX + headerWidth * 0.7, headerY, headerWidth * 0.3, 1.2, 'F');

  // Institution Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('R.V.R. & J.C. COLLEGE OF ENGINEERING', pageWidth / 2, headerY + 8, { align: 'center' });

  // Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240); // #e2e8f0
  doc.text('Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh - 522019', pageWidth / 2, headerY + 13.5, { align: 'center' });

  // Event Header Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11); // Gold #f59e0b
  doc.text('COLORIDO 2K26 — OFFICIAL REGISTRATION E-PASS', pageWidth / 2, headerY + 20, { align: 'center' });

  // Registration ID & Status Block
  const idBlockY = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // #64748b
  doc.text('E-PASS / REGISTRATION NUMBER', headerX + 2, idBlockY);

  // Unique ID (e.g. CD26000001)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text(registration.registrationId || 'CD26000001', headerX + 2, idBlockY + 7);

  // Status Badge (Top Right)
  const badgeWidth = 44;
  const badgeHeight = 7;
  const badgeX = headerX + headerWidth - badgeWidth - 2;
  const badgeY = idBlockY - 2;

  doc.setFillColor(236, 253, 245); // Light mint #ecfdf5
  doc.setDrawColor(16, 185, 129); // Emerald #10b981
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text(`STATUS: ${(registration.status || 'CONFIRMED').toUpperCase()}`, badgeX + badgeWidth / 2, badgeY + 4.8, { align: 'center' });

  // Registered Timestamp
  const regDateObj = registration.registrationDate ? new Date(registration.registrationDate) : new Date();
  const dateFormatted = regDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormatted = regDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Registered: ${dateFormatted} ${timeFormatted}`, headerX + headerWidth - 2, idBlockY + 10, { align: 'right' });

  // Helper: Section Header Bar
  const renderSectionHeader = (title, yPos) => {
    doc.setFillColor(238, 242, 249); // #eef2f9
    doc.rect(headerX, yPos, headerWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59); // #1e293b
    doc.text(title, headerX + 3, yPos + 4.2);
  };

  // Helper: Key Value Pair
  const renderField = (label, value, x, y, valueColor = [15, 23, 42]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text(`${label}:`, x, y);

    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    doc.text(String(value || 'N/A'), x + labelWidth, y);
  };

  // ================= 1. REGISTERED EVENT DETAILS =================
  let curY = 62;
  renderSectionHeader('1. REGISTERED EVENT DETAILS', curY);

  curY += 8;
  const isTeam = registration.registrationType === 'Team Participation' ||
                 (registration.teammates && registration.teammates.length > 1) ||
                 Boolean(registration.teamName && registration.teamName.trim());

  renderField('Event Name', registration.event, headerX + 3, curY);
  renderField('Registration Type', isTeam ? 'Team Participation' : 'Individual Participation', headerX + 90, curY, isTeam ? [217, 119, 6] : [15, 23, 42]);

  curY += 6;
  renderField('Category', registration.category, headerX + 3, curY);
  renderField('Venue', registration.venue || 'RVRJC Open Air Theatre (OAT)', headerX + 90, curY);

  curY += 6;
  renderField('Schedule', registration.schedule || '2026-02-26 (10:00)', headerX + 3, curY);

  // ================= 2. REGISTERED PARTICIPANT DETAILS =================
  curY += 10;
  const partHeaderTitle = isTeam
    ? '2. REGISTERED PARTICIPANT (TEAM CAPTAIN / PRIMARY REGISTRANT)'
    : '2. REGISTERED PARTICIPANT DETAILS';
  renderSectionHeader(partHeaderTitle, curY);

  curY += 8;
  renderField('Full Name', registration.participantName, headerX + 3, curY);
  renderField('Student ID / Roll No', registration.studentId || 'N/A', headerX + 90, curY);

  curY += 6;
  renderField('College / Inst.', registration.college, headerX + 3, curY);
  renderField('Department', registration.department || 'Computer Science (CSE)', headerX + 90, curY);

  curY += 6;
  renderField('Email Address', registration.email, headerX + 3, curY);
  renderField('Mobile Number', registration.phoneNumber, headerX + 90, curY);

  curY += 6;
  const yearText = registration.year || '2nd Year';
  const genderText = registration.gender || 'Male';
  renderField('Details', `Year: ${yearText} • Gender: ${genderText}`, headerX + 3, curY);

  // ================= 3. REGISTERED TEAM INFORMATION & MEMBERS (IF TEAM) =================
  if (isTeam) {
    curY += 10;
    renderSectionHeader('3. REGISTERED TEAM INFORMATION & MEMBERS', curY);

    curY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Team Name: ', headerX + 3, curY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(registration.teamName || `${registration.participantName}'s Squad`, headerX + 20, curY);

    const totalMembers = (registration.teammates && registration.teammates.length > 0)
      ? registration.teammates.length
      : 1;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Registered Members: ${totalMembers}`, headerX + headerWidth - 3, curY, { align: 'right' });

    curY += 3;

    // Table Data
    const tableBody = [];
    if (registration.teammates && registration.teammates.length > 0) {
      registration.teammates.forEach((m, idx) => {
        tableBody.push([
          String(idx + 1),
          m.name || 'N/A',
          m.rollNo || 'N/A',
          m.phone || 'N/A',
          m.college || registration.college || 'N/A'
        ]);
      });
    } else {
      tableBody.push([
        '1',
        registration.participantName,
        registration.studentId || 'N/A',
        registration.phoneNumber || 'N/A',
        registration.college
      ]);
    }

    autoTable(doc, {
      startY: curY,
      margin: { left: headerX, right: pageWidth - (headerX + headerWidth) },
      head: [['#', 'MEMBER NAME', 'ROLL NO / ID', 'PHONE', 'COLLEGE']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 42, 67], // #102a43
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' }
      },
      styles: {
        fontSize: 7,
        textColor: [30, 41, 59],
        cellPadding: 2,
        lineColor: [226, 232, 240],
        lineWidth: 0.2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    curY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : curY + 25) + 8;
  } else {
    curY += 18;
  }

  // ================= OFFICIAL VERIFICATION & REPORTING NOTICE =================
  const noticeY = Math.max(curY, 228);
  const noticeHeight = 18;

  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.setLineWidth(0.3);
  doc.roundedRect(headerX, noticeY, headerWidth, noticeHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235); // #2563eb
  doc.text('OFFICIAL VERIFICATION & REPORTING NOTICE', headerX + 4, noticeY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text('This computer-generated document confirms official registration for COLORIDO 2K26.', headerX + 4, noticeY + 10.5);
  doc.text('Please present this E-Pass (digital copy or printout) along with your original College Identity Card upon reporting at the registration desk.', headerX + 4, noticeY + 14.5);

  // ================= FOOTER =================
  const footerY = pageHeight - margin - 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text(
    `COLORIDO 2K26 • R.V.R. & J.C. College of Engineering • Pass Ref: ${registration.registrationId || 'CD26000001'}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  return doc;
}
