import { jsPDF } from 'jspdf';

/**
 * Generates a premium-styled railway ticket PDF for a booking.
 * @param {Object} booking - The booking object with train, passengers, etc.
 */
export function downloadTicketPDF(booking) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 100] });
  const w = 210;
  const h = 100;

  // Colors
  const navy = [29, 53, 87];
  const red = [230, 57, 70];
  const gray = [108, 117, 125];
  const lightGray = [245, 245, 245];
  const white = [255, 255, 255];
  const black = [10, 10, 10];

  // === Background ===
  doc.setFillColor(...white);
  doc.rect(0, 0, w, h, 'F');

  // === Top banner ===
  doc.setFillColor(...navy);
  doc.rect(0, 0, w, 22, 'F');

  // Logo / Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...white);
  doc.text('RailYatri', 8, 10);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM RAILWAY BOOKING', 8, 15);

  // Status badge
  const isConfirmed = booking.status === 'Confirmed';
  const isRAC = booking.status === 'RAC';
  const isWL = booking.status === 'Waitlist';
  const statusColor = isConfirmed ? [34, 197, 94] : isRAC ? [249, 115, 22] : isWL ? [168, 85, 247] : [239, 68, 68];
  doc.setFillColor(...statusColor);
  doc.roundedRect(w - 45, 5, 37, 8, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...white);
  const statusText = booking.status + (booking.waitlistNumber ? ` WL/${booking.waitlistNumber}` : '');
  doc.text(statusText.toUpperCase(), w - 26.5, 10.5, { align: 'center' });

  // Booking ID
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 220);
  const bookingId = booking._id || 'N/A';
  doc.text(`Booking ID: ${bookingId}`, w - 8, 18, { align: 'right' });

  // === Train info row ===
  const trainName = booking.train?.name || 'Unknown Train';
  const trainNumber = booking.train?.number || '';
  const source = booking.train?.source || '—';
  const destination = booking.train?.destination || '—';
  const departure = booking.train?.departureTime
    ? new Date(booking.train.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
  const arrival = booking.train?.arrivalTime
    ? new Date(booking.train.arrivalTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  // Light stripe
  doc.setFillColor(...lightGray);
  doc.rect(0, 22, w, 18, 'F');

  // Train name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text(trainName, 8, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.text(`#${trainNumber}`, 8, 35);

  // Route
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text(source, 80, 30);
  doc.setFontSize(8);
  doc.setTextColor(...red);
  doc.text('→', 115, 30);
  doc.setTextColor(...navy);
  doc.text(destination, 122, 30);

  // Times
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...gray);
  doc.text(`Dep: ${departure}`, 80, 35);
  doc.text(`Arr: ${arrival}`, 122, 35);

  // === Dashed separator ===
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(8, 42, w - 8, 42);
  doc.setLineDashPattern([], 0);

  // === Passengers ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...red);
  doc.text('PASSENGERS', 8, 48);

  const passengers = booking.passengers || [];
  let yPos = 53;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  passengers.forEach((p, i) => {
    if (yPos > h - 18) return; // safety
    doc.setTextColor(...black);
    doc.text(`${i + 1}. ${p.name}`, 10, yPos);
    doc.setTextColor(...gray);
    doc.text(`Age: ${p.age}`, 60, yPos);
    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'bold');
    doc.text(`Seat: ${p.seatNumber}`, 85, yPos);
    doc.setTextColor(...gray);
    doc.setFont('helvetica', 'normal');
    doc.text(`₹${p.price || '—'}`, 125, yPos);
    yPos += 5;
  });

  // === Bottom bar ===
  doc.setFillColor(...navy);
  doc.rect(0, h - 14, w, 14, 'F');

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Total: ₹${booking.totalAmount || 0}`, 8, h - 6);

  // Payment status
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 220);
  doc.text(`Payment: ${booking.paymentStatus || 'N/A'}`, 60, h - 6);

  // Booked date
  const bookedDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
  doc.text(`Booked: ${bookedDate}`, 100, h - 6);

  // Seats count
  doc.text(`${booking.seatsCount || passengers.length} seat(s)`, w - 8, h - 6, { align: 'right' });

  // === Decorative red accent line ===
  doc.setFillColor(...red);
  doc.rect(0, 22, 3, 18, 'F');

  // === Save ===
  const fileName = `RailYatri_Ticket_${bookingId.slice(-6).toUpperCase()}.pdf`;
  doc.save(fileName);
}
