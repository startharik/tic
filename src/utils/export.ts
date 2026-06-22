import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  data: any[];
  fileName: string;
  sheetName?: string;
}

export const exportToCSV = ({ data, fileName }: ExportOptions) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => JSON.stringify((row as any)[fieldName])).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = ({ data, fileName, sheetName = 'Sheet1' }: ExportOptions) => {
  if (data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = ({ 
  data, 
  fileName, 
  title = fileName 
}: ExportOptions & { title?: string }) => {
  if (data.length === 0) return;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  // Prepare table data
  const headers = Object.keys(data[0]);
  const tableData = data.map(row => headers.map(header => (row as any)[header]));

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 40,
    theme: 'striped',
    headStyles: {
      fillColor: [29, 78, 216],
      textColor: 255,
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
  });

  doc.save(`${fileName}.pdf`);
};