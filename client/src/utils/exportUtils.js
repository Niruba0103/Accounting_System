import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.jpeg';

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 */
export const exportToExcel = (data, fileName = 'report') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Export data to PDF
 * @param {Object} options - Options for PDF generation
 * @param {Array} options.head - Headers for the table (e.g. [['Date', 'Description', 'Amount']])
 * @param {Array} options.body - Body data for the table (e.g. [['2023-01-01', 'Test', '100']])
 * @param {String} options.fileName - Name of the file (without extension)
 * @param {String} options.title - Title to display on the PDF
 * @param {String} options.subtitle - Subtitle to display on the PDF
 */
export const exportToPDF = ({ head, body, fileName = 'report', title = 'Report', subtitle = '' }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Add Logo
  try {
    doc.addImage(logo, 'JPEG', 14, 12, 12, 12);
  } catch (err) {
    console.error('Error adding logo to PDF:', err);
  }

  // Add Company Heading
  doc.setFontSize(14);
  doc.setTextColor(26, 32, 44); // Deep charcoal
  doc.setFont('helvetica', 'bold');
  doc.text('PRIMESUPPLY', 28, 17);
  
  doc.setFontSize(9);
  doc.setTextColor(113, 128, 150); // Slate gray
  doc.setFont('helvetica', 'normal');
  doc.text('ACCOUNTING SYSTEM', 28, 22);

  // Horizontal Separator
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 28, 283, 28);

  // Report details
  doc.setFontSize(16);
  doc.setTextColor(26, 32, 44);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 40);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(74, 85, 104);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 46);
  }

  // Add Table
  autoTable(doc, {
    head: head,
    body: body,
    startY: subtitle ? 52 : 46,
    theme: 'grid',
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle'
    },
    headStyles: { 
      fillColor: [45, 55, 72], // Dark navy/slate
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    margin: { top: 40, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer: Page Number
      doc.setFontSize(8);
      doc.setTextColor(160, 174, 192);
      const str = 'Page ' + doc.internal.getNumberOfPages();
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(`${fileName}.pdf`);
};
