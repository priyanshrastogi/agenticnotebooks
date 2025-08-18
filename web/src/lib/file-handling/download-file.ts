import * as XLSX from 'xlsx';

import { FileData } from './types';

/**
 * Converts FileData to a downloadable file in the appropriate format
 * @param fileData The file data to convert
 * @param fileName The name for the downloaded file
 */
export function downloadFile(fileData: FileData, fileName: string): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Add each sheet to the workbook
  Object.entries(fileData.sheets).forEach(([sheetName, sheetData]) => {
    // Convert sheet data to worksheet format
    const rows = sheetData.data;

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Determine file extension and output format
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  if (isCsv) {
    // For CSV files, we only export the active sheet
    const activeSheetName = fileData.activeSheet;
    const activeWorksheet = workbook.Sheets[activeSheetName];

    if (activeWorksheet) {
      // Convert the active worksheet to CSV
      const csv = XLSX.utils.sheet_to_csv(activeWorksheet);

      // Create a Blob and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    }
  } else {
    // Ensure the filename has the correct extension for Excel files
    const downloadFileName =
      fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ? fileName : `${fileName}.xlsx`;

    // Write the workbook as Excel and trigger download
    XLSX.writeFile(workbook, downloadFileName);
  }
}

// Legacy function name maintained for backward compatibility
export const downloadExcelFile = downloadFile;
