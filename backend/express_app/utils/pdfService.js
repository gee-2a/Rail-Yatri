const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// ─── Color Palette ───────────────────────────────────────────────────────────
const COLORS = {
    primary:      '#1D3557',   // deep navy
    accent:       '#E63946',   // railyatri red
    secondary:    '#457B9D',   // steel blue
    lightBg:      '#F0F4F8',   // off-white background
    white:        '#FFFFFF',
    textDark:     '#0A0A0A',
    textMid:      '#4A5568',
    textLight:    '#718096',
    borderLight:  '#E2E8F0',
    confirmed:    '#2D6A4F',   // deep green
    rac:          '#B45309',   // amber
    waitlist:     '#6B21A8',   // purple
    cancelled:    '#991B1B',   // deep red
};

/**
 * Get the status badge color based on booking status.
 */
function getStatusColor(status) {
    if (status === 'Confirmed') return COLORS.confirmed;
    if (status === 'RAC') return COLORS.rac;
    if (status === 'Waitlist') return COLORS.waitlist;
    return COLORS.cancelled;
}

/**
 * Draw a rounded rectangle (since PDFKit doesn't natively support it easily).
 */
function roundedRect(doc, x, y, w, h, r, fill, stroke) {
    doc.roundedRect(x, y, w, h, r);
    if (fill && stroke) doc.fillAndStroke(fill, stroke);
    else if (fill) doc.fill(fill);
    else if (stroke) doc.stroke(stroke);
    return doc;
}

/**
 * Generates a beautiful, Indian railway-style e-ticket PDF.
 */
exports.generateTicketPDF = (booking) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 0, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const pageW = doc.page.width;    // 595.28
            const pageH = doc.page.height;   // 841.89
            const margin = 36;
            const innerW = pageW - margin * 2;

            // ─── Background ─────────────────────────────────────────────────
            doc.rect(0, 0, pageW, pageH).fill(COLORS.lightBg);

            // ─── Header Banner ───────────────────────────────────────────────
            doc.rect(0, 0, pageW, 110).fill(COLORS.primary);

            // Logo text / Brand
            doc.fillColor(COLORS.white).fontSize(26).font('Helvetica-Bold')
               .text('RAILYATRI', margin, 24);

            doc.fillColor(COLORS.accent).fontSize(10).font('Helvetica-Bold')
               .text('E-TICKET', margin, 54, { characterSpacing: 3 });

            // Decorative diagonal stripes on header (right side)
            doc.save();
            for (let i = 0; i < 8; i++) {
                doc.rect(pageW - 120 + i * 18, 0, 10, 110)
                   .fill(`rgba(255,255,255,0.04)`);
            }
            doc.restore();

            // Status badge (top right in header)
            const statusColor = getStatusColor(booking.status);
            roundedRect(doc, pageW - margin - 110, 28, 110, 38, 6, statusColor, null);
            doc.fillColor(COLORS.white).fontSize(13).font('Helvetica-Bold')
               .text(booking.status.toUpperCase(), pageW - margin - 110, 38, { width: 110, align: 'center' });

            // ─── QR Code ────────────────────────────────────────────────────
            const trainNumber = booking.train ? booking.train.number : 'N/A';
            const depDate = booking.train ? new Date(booking.train.departureTime).toLocaleDateString('en-IN') : 'N/A';
            const qrData = JSON.stringify({
                bookingId: booking._id.toString(),
                train: trainNumber,
                date: depDate,
                pnr: booking._id.toString().slice(-8).toUpperCase()
            });
            const qrImageBuffer = await QRCode.toBuffer(qrData, {
                errorCorrectionLevel: 'M',
                margin: 1,
                color: { dark: COLORS.primary, light: '#FFFFFF' }
            });

            // QR goes bottom-right on header
            doc.image(qrImageBuffer, pageW - margin - 90, 10, { width: 90, height: 90 });

            // ─── PNR / Booking Info Bar ──────────────────────────────────────
            let y = 118;
            roundedRect(doc, margin, y, innerW, 48, 8, COLORS.white, COLORS.borderLight);

            const pnrStr = booking._id.toString().slice(-10).toUpperCase();
            doc.fillColor(COLORS.textMid).fontSize(8).font('Helvetica').text('PNR / BOOKING ID', margin + 16, y + 10);
            doc.fillColor(COLORS.primary).fontSize(14).font('Helvetica-Bold').text(pnrStr, margin + 16, y + 21);

            doc.fillColor(COLORS.textMid).fontSize(8).font('Helvetica').text('BOOKED ON', margin + 220, y + 10);
            doc.fillColor(COLORS.textDark).fontSize(11).font('Helvetica-Bold')
               .text(new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), margin + 220, y + 21);

            doc.fillColor(COLORS.textMid).fontSize(8).font('Helvetica').text('PASSENGERS', margin + 420, y + 10);
            doc.fillColor(COLORS.textDark).fontSize(14).font('Helvetica-Bold')
               .text(String(booking.passengers ? booking.passengers.length : 1), margin + 420, y + 21);

            // ─── Train Journey Card ─────────────────────────────────────────
            y += 58;
            roundedRect(doc, margin, y, innerW, 120, 8, COLORS.white, COLORS.borderLight);

            // Train name + number
            const trainName = booking.train ? booking.train.name : 'N/A';
            const trainNum = booking.train ? booking.train.number : 'N/A';
            doc.fillColor(COLORS.primary).fontSize(17).font('Helvetica-Bold').text(trainName, margin + 16, y + 14);
            doc.fillColor(COLORS.textMid).fontSize(10).font('Helvetica').text(`Train No. ${trainNum}`, margin + 16, y + 35);

            // Journey route visual
            const depTime = booking.train ? new Date(booking.train.departureTime) : null;
            const arrTime = booking.train ? new Date(booking.train.arrivalTime) : null;
            const src = booking.train ? booking.train.source : 'N/A';
            const dst = booking.train ? booking.train.destination : 'N/A';

            // Source station
            const routeY = y + 60;
            doc.fillColor(COLORS.textMid).fontSize(8).font('Helvetica').text('DEPARTURE', margin + 16, routeY - 12);
            doc.fillColor(COLORS.primary).fontSize(20).font('Helvetica-Bold').text(src.substring(0, 15), margin + 16, routeY);
            doc.fillColor(COLORS.textDark).fontSize(11).font('Helvetica')
               .text(depTime ? depTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A', margin + 16, routeY + 23);
            doc.fillColor(COLORS.textLight).fontSize(8).font('Helvetica')
               .text(depTime ? depTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '', margin + 16, routeY + 36);

            // Arrow / divider
            const arrowCX = margin + innerW / 2;
            doc.strokeColor(COLORS.borderLight).lineWidth(1.5)
               .moveTo(margin + 200, routeY + 15).lineTo(arrowCX - 20, routeY + 15).stroke();
            doc.polygon([arrowCX - 20, routeY + 11], [arrowCX - 10, routeY + 15], [arrowCX - 20, routeY + 19])
               .fill(COLORS.accent);
            doc.fillColor(COLORS.accent).fontSize(7).font('Helvetica-Bold')
               .text('→ TRAIN →', arrowCX - 26, routeY + 21, { align: 'center', width: 52 });

            // Destination station
            const dstX = arrowCX + 40;
            doc.fillColor(COLORS.textMid).fontSize(8).font('Helvetica').text('ARRIVAL', dstX, routeY - 12);
            doc.fillColor(COLORS.secondary).fontSize(20).font('Helvetica-Bold').text(dst.substring(0, 15), dstX, routeY);
            doc.fillColor(COLORS.textDark).fontSize(11).font('Helvetica')
               .text(arrTime ? arrTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A', dstX, routeY + 23);
            doc.fillColor(COLORS.textLight).fontSize(8).font('Helvetica')
               .text(arrTime ? arrTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '', dstX, routeY + 36);

            // ─── Passenger Table ─────────────────────────────────────────────
            y += 130;
            // Section title
            doc.fillColor(COLORS.primary).fontSize(11).font('Helvetica-Bold').text('PASSENGER DETAILS', margin, y);
            doc.strokeColor(COLORS.accent).lineWidth(2).moveTo(margin, y + 15).lineTo(margin + 160, y + 15).stroke();

            y += 22;
            // Table header
            const colWidths = [30, 180, 50, 90, 100, 80];  // No, Name, Age, Seat, Coach, Fare
            const colLabels = ['#', 'PASSENGER NAME', 'AGE', 'SEAT NO.', 'COACH', 'FARE (₹)'];
            const colX = [margin, margin + 30, margin + 210, margin + 260, margin + 350, margin + 440];

            roundedRect(doc, margin, y, innerW, 24, 4, COLORS.primary, null);
            colLabels.forEach((label, i) => {
                doc.fillColor(COLORS.white).fontSize(7.5).font('Helvetica-Bold')
                   .text(label, colX[i] + 4, y + 8, { width: colWidths[i], align: i >= 2 ? 'center' : 'left' });
            });

            y += 24;
            booking.passengers.forEach((p, index) => {
                const rowBg = index % 2 === 0 ? COLORS.white : '#F7FAFC';
                roundedRect(doc, margin, y, innerW, 26, 0, rowBg, COLORS.borderLight);

                const coachParts = (p.seatNumber || '').split('-');
                const coachName = coachParts[0] || 'General';
                const seatNum = coachParts[1] || p.seatNumber || '';

                const rowData = [
                    String(index + 1),
                    p.name || 'N/A',
                    String(p.age || 'N/A'),
                    seatNum,
                    coachName,
                    `${p.price || 0}`
                ];
                rowData.forEach((val, ci) => {
                    doc.fillColor(ci === 1 ? COLORS.textDark : COLORS.textMid)
                       .fontSize(ci === 1 ? 9 : 8.5)
                       .font(ci === 1 ? 'Helvetica-Bold' : 'Helvetica')
                       .text(val, colX[ci] + 4, y + 8, { width: colWidths[ci], align: ci >= 2 ? 'center' : 'left' });
                });
                y += 26;
            });

            // Table bottom border
            doc.strokeColor(COLORS.borderLight).lineWidth(1).moveTo(margin, y).lineTo(margin + innerW, y).stroke();

            // ─── Payment Summary ─────────────────────────────────────────────
            y += 16;
            roundedRect(doc, margin, y, innerW, 70, 8, COLORS.white, COLORS.borderLight);

            doc.fillColor(COLORS.primary).fontSize(11).font('Helvetica-Bold').text('FARE SUMMARY', margin + 16, y + 12);

            // Fare breakdown line
            doc.fillColor(COLORS.textMid).fontSize(9).font('Helvetica')
               .text('Base Fare × Passengers:', margin + 16, y + 32);
            doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica')
               .text(`₹${booking.totalAmount}`, margin + 16, y + 32, { width: innerW - 32, align: 'right' });

            // Divider
            doc.strokeColor(COLORS.borderLight).lineWidth(0.5)
               .moveTo(margin + 16, y + 47).lineTo(margin + innerW - 16, y + 47).stroke();

            // Total amount
            doc.fillColor(COLORS.primary).fontSize(13).font('Helvetica-Bold').text('TOTAL AMOUNT PAID:', margin + 16, y + 52);
            doc.fillColor(COLORS.accent).fontSize(16).font('Helvetica-Bold')
               .text(`₹ ${booking.totalAmount}`, margin + 16, y + 50, { width: innerW - 32, align: 'right' });

            // ─── Terms / Footer Strip ────────────────────────────────────────
            y += 86;
            roundedRect(doc, margin, y, innerW, 52, 8, COLORS.primary, null);
            doc.fillColor(COLORS.white).fontSize(7.5).font('Helvetica')
               .text('• This is a computer-generated e-ticket. No signature is required.', margin + 14, y + 9)
               .text('• Please carry a valid photo ID proof during your journey.', margin + 14, y + 21)
               .text('• Ticket cancellation policies apply. Refunds processed within 5-7 business days.', margin + 14, y + 33)
               .text('• For support, contact: support@railyatri.in', margin + 14, y + 45);

            // Powered by text
            doc.fillColor(COLORS.accent).fontSize(8).font('Helvetica-Bold')
               .text('Powered by RailYatri', 0, y + 9, { width: pageW, align: 'right' });

            // Scan QR label
            doc.fillColor(COLORS.textLight).fontSize(7).font('Helvetica')
               .text('Scan QR to verify', pageW - margin - 90, y + 85, { width: 90, align: 'center' });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};
