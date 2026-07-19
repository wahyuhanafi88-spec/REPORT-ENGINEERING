import { Ticket, PMTask, EnergyReading, ToolItem, MaterialItem, CostRecord, Employee } from '../types';

export const SHEET_NAMES = [
  'employees',
  'tickets',
  'pmTasks',
  'energyReadings',
  'tools',
  'materials',
  'costs'
];

const HEADERS: Record<string, string[]> = {
  employees: ['id', 'name', 'role', 'nik', 'phone', 'email', 'status', 'assignedBuilding'],
  tickets: ['id', 'ticketNo', 'title', 'description', 'reporterName', 'building', 'floorArea', 'assetType', 'priority', 'status', 'assignedTo', 'createdAt', 'finishedAt', 'cost', 'photoUrl', 'actionTaken'],
  pmTasks: ['id', 'code', 'title', 'assetName', 'frequency', 'building', 'checklist', 'status', 'scheduledDate', 'completedDate', 'completedBy'],
  energyReadings: ['id', 'date', 'building', 'electricityReading', 'waterReading', 'recordedBy'],
  tools: ['id', 'name', 'totalQuantity', 'goodCondition', 'badCondition', 'location'],
  materials: ['id', 'name', 'category', 'stock', 'unit', 'minStock', 'location'],
  costs: ['id', 'date', 'category', 'description', 'cost', 'building']
};

function getColLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const tempChar = (temp - 1) % 26;
    letter = String.fromCharCode(65 + tempChar) + letter;
    temp = Math.floor((temp - tempChar) / 26);
  }
  return letter;
}

export async function findOrCreateSpreadsheet(accessToken: string): Promise<string> {
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='BSS Engineering App Data' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!searchRes.ok) {
    throw new Error(`Search failed: ${searchRes.statusText}`);
  }
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create if not found
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: 'BSS Engineering App Data'
      },
      sheets: SHEET_NAMES.map(name => ({
        properties: { title: name }
      }))
    })
  });

  if (!createRes.ok) {
    throw new Error(`Creation failed: ${createRes.statusText}`);
  }
  const createData = await createRes.json();
  return createData.spreadsheetId;
}

export async function saveSheetData(
  spreadsheetId: string,
  sheetName: string,
  data: any[],
  accessToken: string
): Promise<void> {
  const headers = HEADERS[sheetName];
  if (!headers) throw new Error(`Unknown sheet name: ${sheetName}`);

  const rows = [headers];
  for (const item of data) {
    const row = headers.map(header => {
      const val = item[header];
      if (val === undefined || val === null) {
        return '';
      }
      if (typeof val === 'object') {
        return JSON.stringify(val);
      }
      return String(val);
    });
    rows.push(row);
  }

  const range = `${sheetName}!A1:${getColLetter(headers.length)}${data.length + 1}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`;
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Failed to save sheet ${sheetName}:`, errText);
    throw new Error(`Failed to save sheet ${sheetName}: ${res.statusText}`);
  }
}

export async function loadSheetData(
  spreadsheetId: string,
  sheetName: string,
  accessToken: string
): Promise<any[] | null> {
  const headers = HEADERS[sheetName];
  if (!headers) throw new Error(`Unknown sheet name: ${sheetName}`);

  const range = `${sheetName}!A1:Z5000`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    console.error(`Failed to load sheet ${sheetName}: ${res.statusText}`);
    return null;
  }

  const result = await res.json();
  const rows = result.values;
  if (!rows || rows.length <= 1) {
    return [];
  }

  const sheetHeaders: string[] = rows[0];
  const items: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item: any = {};
    let hasValue = false;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const actualIndex = sheetHeaders.indexOf(header);
      if (actualIndex !== -1 && row[actualIndex] !== undefined) {
        const valStr = row[actualIndex];
        if (valStr !== '') {
          hasValue = true;
          if (header === 'checklist') {
            try {
              item[header] = JSON.parse(valStr);
            } catch (e) {
              item[header] = [];
            }
          } else if (['totalQuantity', 'goodCondition', 'badCondition', 'stock', 'minStock', 'cost', 'electricityReading', 'waterReading'].includes(header)) {
            const num = Number(valStr);
            item[header] = isNaN(num) ? valStr : num;
          } else {
            item[header] = valStr;
          }
        } else {
          if (header === 'checklist') {
            item[header] = [];
          } else {
            item[header] = '';
          }
        }
      } else {
        if (header === 'checklist') {
          item[header] = [];
        } else {
          item[header] = '';
        }
      }
    }
    if (hasValue && item.id) {
      items.push(item);
    }
  }

  return items;
}

export async function syncAllToSheets(
  spreadsheetId: string,
  allData: {
    employees: Employee[];
    tickets: Ticket[];
    pmTasks: PMTask[];
    energyReadings: EnergyReading[];
    tools: ToolItem[];
    materials: MaterialItem[];
    costs: CostRecord[];
  },
  accessToken: string
): Promise<void> {
  await saveSheetData(spreadsheetId, 'employees', allData.employees, accessToken);
  await saveSheetData(spreadsheetId, 'tickets', allData.tickets, accessToken);
  await saveSheetData(spreadsheetId, 'pmTasks', allData.pmTasks, accessToken);
  await saveSheetData(spreadsheetId, 'energyReadings', allData.energyReadings, accessToken);
  await saveSheetData(spreadsheetId, 'tools', allData.tools, accessToken);
  await saveSheetData(spreadsheetId, 'materials', allData.materials, accessToken);
  await saveSheetData(spreadsheetId, 'costs', allData.costs, accessToken);
}
