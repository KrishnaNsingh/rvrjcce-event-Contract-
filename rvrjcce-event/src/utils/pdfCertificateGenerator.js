import { jsPDF } from 'jspdf';

/**
 * Official Certificate of Merit & Excellence PDF Generator
 * Designed to university protocol specifications for COLORIDO 2K26.
 */
export function generateCertificatePDF(result) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background Parchment Tint
  doc.setFillColor(254, 253, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Deep Navy Border
  doc.setDrawColor(14, 34, 61); // Oxford Navy #0E223D
  doc.setLineWidth(1.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');

  // Inner Ornate Gold Border
  doc.setDrawColor(189, 138, 48); // Regal Warm Gold
  doc.setLineWidth(0.7);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

  // Corner Flourish Lines
  const drawCornerFlourish = (x, y, dx, dy) => {
    doc.setDrawColor(158, 71, 42); // Terracotta
    doc.setLineWidth(0.5);
    doc.line(x, y, x + dx * 12, y);
    doc.line(x, y, x, y + dy * 12);
    doc.circle(x + dx * 3, y + dy * 3, 1, 'FD');
  };
  drawCornerFlourish(14, 14, 1, 1);
  drawCornerFlourish(pageWidth - 14, 14, -1, 1);
  drawCornerFlourish(14, pageHeight - 14, 1, -1);
  drawCornerFlourish(pageWidth - 14, pageHeight - 14, -1, -1);

  // Institution Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(14, 34, 61);
  doc.text('R.V.R. & J.C. COLLEGE OF ENGINEERING', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 95, 105);
  doc.text('(AUTONOMOUS) • ACCREDITED BY NAAC WITH "A+" GRADE • AFFILIATED TO ACHARYA NAGARJUNA UNIVERSITY', pageWidth / 2, 31.5, { align: 'center' });
  doc.text('Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh - 522019', pageWidth / 2, 36, { align: 'center' });

  // Event Tagline Ribbon
  doc.setFillColor(158, 71, 42); // Terracotta Ribbon
  doc.rect(pageWidth / 2 - 80, 41, 160, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('40TH INTER-COLLEGIATE SPORTS & CULTURAL MEET • COLORIDO 2K26', pageWidth / 2, 46, { align: 'center' });

  // Main Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(14, 34, 61);
  doc.text('Certificate of Merit & Excellence', pageWidth / 2, 63, { align: 'center' });

  // Thin Decorative Separator
  doc.setDrawColor(189, 138, 48);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 50, 68, pageWidth / 2 + 50, 68);
  doc.setFillColor(189, 138, 48);
  doc.circle(pageWidth / 2, 68, 1.2, 'F');

  // Presentation Citation
  doc.setFont('times', 'italic');
  doc.setFontSize(12.5);
  doc.setTextColor(60, 65, 75);
  doc.text('This is to proudly certify that', pageWidth / 2, 78, { align: 'center' });

  // Recipient / Participant Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(158, 71, 42); // Terracotta Accent
  const winnerName = result.participantName || result.name || 'Participant';
  doc.text(winnerName.toUpperCase(), pageWidth / 2, 87, { align: 'center' });

  // Underline beneath name
  const nameWidth = doc.getTextWidth(winnerName.toUpperCase());
  doc.setDrawColor(158, 71, 42);
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - nameWidth / 2 - 4, 89, pageWidth / 2 + nameWidth / 2 + 4, 89);

  // College & Institutional Affiliation
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(40, 45, 55);
  const collegeText = `representing ${result.college || 'R.V.R. & J.C. College of Engineering'}${result.teamName ? ` (${result.teamName})` : ''}`;
  doc.text(collegeText, pageWidth / 2, 97, { align: 'center' });

  // Achievement Citation
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text('has demonstrated exemplary skill, sportsmanship, and distinction by securing', pageWidth / 2, 105, { align: 'center' });

  // Position Badge & Event Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(14, 34, 61);
  const positionText = (result.position || '1st Place - Winner').toUpperCase();
  doc.text(positionText, pageWidth / 2, 115, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(158, 71, 42);
  const eventDetails = `in ${result.event || 'Tournament Championship'} (${result.division || 'All Divisions'})`;
  doc.text(eventDetails, pageWidth / 2, 122, { align: 'center' });

  // Additional detail (Score or Remarks)
  if (result.scoreOrRound) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(90, 95, 105);
    doc.text(`Official Match Record: ${result.scoreOrRound}`, pageWidth / 2, 128, { align: 'center' });
  }

  // Teammates List (if Team event)
  if (Array.isArray(result.teammates) && result.teammates.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 85, 95);
    const squad = `Winning Squad: ${result.teammates.join(' • ')}`;
    doc.text(squad, pageWidth / 2, 134, { align: 'center', maxWidth: 220 });
  }

  // Date and Certificate Verification ID
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 105, 115);
  doc.text(`Certificate ID: ${result.certificateId || 'CERT-CD26-OFFICIAL'}`, 24, 156);
  doc.text(`Conferred on: ${result.dateAnnounced || 'February 25, 2026'}`, 24, 161);
  doc.text(`Venue: RVRJCCE Campus, Guntur`, 24, 166);

  // Verification Seal
  doc.setFillColor(250, 242, 237);
  doc.setDrawColor(189, 138, 48);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, 158, 14, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(158, 71, 42);
  doc.text('OFFICIAL VERIFIED', pageWidth / 2, 155.5, { align: 'center' });
  doc.text('★ COLORIDO 2K26 ★', pageWidth / 2, 159.5, { align: 'center' });
  doc.text('MERIT LAUREL', pageWidth / 2, 163.5, { align: 'center' });

  // Signature Blocks
  const sigY = 178;

  // Sign 1: Sports / Cultural Incharge
  doc.setDrawColor(120, 125, 135);
  doc.setLineWidth(0.3);
  doc.line(30, sigY, 90, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 34, 61);
  doc.text('Dr. P. Gopi Krishna / Dr. Ch. Suneetha', 60, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 95, 105);
  doc.text('Tournament & Cultural Directors', 60, sigY + 9, { align: 'center' });

  // Sign 2: Dean of Student Affairs
  doc.line(118, sigY, 178, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 34, 61);
  doc.text('Dr. G. Kishore Babu', 148, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 95, 105);
  doc.text('Dean of Student Affairs & Convener', 148, sigY + 9, { align: 'center' });

  // Sign 3: Principal & Patron
  doc.line(206, sigY, 266, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 34, 61);
  doc.text('Dr. K. Ravindra', 236, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 95, 105);
  doc.text('Principal & Chief Patron', 236, sigY + 9, { align: 'center' });

  // Save PDF with clear naming
  const cleanId = (result.certificateId || 'CERT-CD26').replace(/[^a-zA-Z0-9-]/g, '_');
  const filename = `Certificate_COLORIDO2K26_${cleanId}.pdf`;
  doc.save(filename);
}
