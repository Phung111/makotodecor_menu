import axios from 'axios';
import { MOCK_SHEET_ROWS } from '../data/mockProducts';

/**
 * Extract raw Sheet ID from a full Google Sheet URL or return string as-is
 */
export function extractSheetId(inputStr = '') {
  if (!inputStr) return '';
  const trimmed = inputStr.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : trimmed;
}

/**
 * Fetch raw sheet data from a Public Google Sheet (GViz JSON API)
 * @param {string} rawInput - Google Sheet ID or Full URL
 * @param {string} sheetName - Optional Sheet tab name (if empty or default, fetches first sheet)
 */
export async function fetchGoogleSheetRows(rawInput = '', sheetName = '') {
  const spreadsheetId = extractSheetId(rawInput);

  if (!spreadsheetId) {
    console.log('[GoogleSheetService] No spreadsheetId provided. Using MOCK_SHEET_ROWS fallback.');
    return MOCK_SHEET_ROWS;
  }

  try {
    // If sheetName is provided, include it in URL. Otherwise GViz fetches the 1st tab automatically!
    const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json${sheetParam}`;
    const response = await axios.get(url);

    // GViz response wraps JSON in setResponse(...)
    const match = response.data.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
    if (!match || !match[1]) {
      throw new Error('Invalid GViz response format');
    }

    const parsedData = JSON.parse(match[1]);
    const cols = parsedData.table.cols.map(c => c.label || c.id);
    const rows = parsedData.table.rows;

    const formattedRows = rows.map(r => {
      const rowObj = {};
      if (r && r.c) {
        r.c.forEach((cell, idx) => {
          const colName = cols[idx] || `col_${idx}`;
          rowObj[colName] = cell ? cell.v : '';
        });
      }
      return rowObj;
    });

    return formattedRows.length > 0 ? formattedRows : MOCK_SHEET_ROWS;
  } catch (error) {
    console.error('[GoogleSheetService] Error fetching Google Sheet data:', error);
    return MOCK_SHEET_ROWS;
  }
}
