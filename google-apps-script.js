function doGet(e) {
  return ContentService.createTextOutput('Use POST method');
}

function doPost(e) {
  if (e && e.parameter && e.parameter.action === 'getSheets') {
    const ss = SpreadsheetApp.openById('1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA');
    const sheets = ss.getSheets().map(sheet => sheet.getName());
    return ContentService.createTextOutput(JSON.stringify(sheets)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (e && e.parameter && e.parameter.action === 'getLeads') {
    const ss = SpreadsheetApp.openById('1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA');
    const allLeadsSheet = ss.getSheetByName('All leads');
    
    if (!allLeadsSheet || allLeadsSheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = allLeadsSheet.getDataRange().getValues();
    const headers = data[0];
    const leads = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      leads.push({
        uid: row[0],
        slNo: row[1],
        phone: row[2],
        country: row[3],
        place: row[4],
        name: row[5],
        leadQuality: row[6],
        businessIndustry: row[7],
        specialNotes: row[8],
        currentStatus: row[9],
        forwardedTo: row[10],
        dateTime: row[11]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(leads)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (e && e.parameter && e.parameter.action === 'saveToSheets') {
    const ss = SpreadsheetApp.openById('1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA');
    const uid = e.parameter.uid || Utilities.getUuid();
    
    // Generate SL No for All leads sheet
    let allLeadsSlNo = e.parameter.slNo;
    if (!allLeadsSlNo) {
      const allLeadsSheet = ss.getSheetByName('All leads');
      if (allLeadsSheet && allLeadsSheet.getLastRow() > 1) {
        allLeadsSlNo = (allLeadsSheet.getLastRow()).toString();
      } else {
        allLeadsSlNo = '1';
      }
    }
    
    // Generate SL No for target sheet
    let targetSlNo = allLeadsSlNo;
    if (e.parameter.forwardedTo && e.parameter.forwardedTo !== 'All leads') {
      const targetSheet = ss.getSheetByName(e.parameter.forwardedTo);
      if (targetSheet && targetSheet.getLastRow() > 1) {
        targetSlNo = (targetSheet.getLastRow()).toString();
      } else {
        targetSlNo = '1';
      }
    }
    
    // Data for "All leads" sheet (with UID hidden in column A)
    const allLeadsData = [
      uid,
      allLeadsSlNo,
      e.parameter.phone,
      e.parameter.country,
      e.parameter.place,
      e.parameter.name,
      e.parameter.leadQuality,
      e.parameter.businessIndustry,
      e.parameter.specialNotes,
      e.parameter.currentStatus,
      e.parameter.forwardedTo,
      e.parameter.dateTime
    ];
    
    // Data for target sheet (with UID hidden in column A)
    const targetSheetData = [
      uid,
      targetSlNo,
      e.parameter.phone,
      e.parameter.country,
      e.parameter.place,
      e.parameter.name,
      e.parameter.leadQuality,
      e.parameter.businessIndustry,
      e.parameter.specialNotes,
      e.parameter.currentStatus,
      e.parameter.dateTime
    ];
    
    // Update or insert in "All leads" sheet
    const allLeadsSheet = ss.getSheetByName('All leads');
    if (allLeadsSheet) {
      updateOrInsertRow(allLeadsSheet, uid, allLeadsData);
    }
    
    // Update or insert in target sheet
    if (e.parameter.forwardedTo && e.parameter.forwardedTo !== '' && e.parameter.forwardedTo !== 'All leads') {
      const targetSheet = ss.getSheetByName(e.parameter.forwardedTo);
      if (targetSheet) {
        updateOrInsertRow(targetSheet, uid, targetSheetData);
      } else {
        console.log('Target sheet not found:', e.parameter.forwardedTo);
      }
    } else {
      console.log('No forwarded sheet specified or forwarded to All leads');
    }
    
    // Sort both sheets after saving
    sortSheetByDate(allLeadsSheet);
    if (e.parameter.forwardedTo && e.parameter.forwardedTo !== '' && e.parameter.forwardedTo !== 'All leads') {
      const targetSheet = ss.getSheetByName(e.parameter.forwardedTo);
      if (targetSheet) {
        sortSheetByDate(targetSheet);
      }
    }
    
    return ContentService.createTextOutput(uid);
  }
  
  if (e && e.parameter && e.parameter.action === 'deleteLead') {
    const ss = SpreadsheetApp.openById('1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA');
    const uid = e.parameter.uid;
    
    console.log('Deleting UID:', uid);
    
    // Delete from all sheets using UID
    const sheets = ss.getSheets();
    let deleted = false;
    sheets.forEach(sheet => {
      if (deleteRowByUid(sheet, uid)) {
        deleted = true;
        console.log('Deleted from sheet:', sheet.getName());
      }
    });
    
    return ContentService.createTextOutput(deleted ? 'Deleted' : 'Not found');
  }
  
  if (e && e.parameter && e.parameter.action === 'getSettings') {
    const ss = SpreadsheetApp.openById('1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA');
    let settingsSheet = ss.getSheetByName('Settings');
    
    if (!settingsSheet) {
      settingsSheet = ss.insertSheet('Settings');
      settingsSheet.getRange('A1:B1').setValues([['Type', 'Value']]);
      settingsSheet.getRange('A2:B6').setValues([
        ['leadQuality', 'HOT'],
        ['leadQuality', 'WARM'],
        ['leadQuality', 'COLD'],
        ['leadQuality', 'FAKE'],
        ['leadQuality', 'UNCATEGORIZED']
      ]);
      settingsSheet.getRange('A7:B11').setValues([
        ['businessIndustry', 'Real Estate'],
        ['businessIndustry', 'Technology'],
        ['businessIndustry', 'Healthcare'],
        ['businessIndustry', 'Finance'],
        ['businessIndustry', 'Education']
      ]);
    }
    
    const data = settingsSheet.getDataRange().getValues();
    const leadQualities = [];
    const businessIndustries = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'leadQuality') {
        leadQualities.push(data[i][1]);
      } else if (data[i][0] === 'businessIndustry') {
        businessIndustries.push(data[i][1]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      leadQualities,
      businessIndustries
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (e && e.parameter && e.parameter.action === 'saveSettings') {
    const ss = SpreadsheetApp.openById('1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA');
    let settingsSheet = ss.getSheetByName('Settings');
    
    if (!settingsSheet) {
      settingsSheet = ss.insertSheet('Settings');
      settingsSheet.getRange('A1:B1').setValues([['Type', 'Value']]);
    } else {
      settingsSheet.clear();
      settingsSheet.getRange('A1:B1').setValues([['Type', 'Value']]);
    }
    
    const leadQualities = JSON.parse(e.parameter.leadQualities || '[]');
    const businessIndustries = JSON.parse(e.parameter.businessIndustries || '[]');
    
    let row = 2;
    leadQualities.forEach(quality => {
      settingsSheet.getRange(row, 1, 1, 2).setValues([['leadQuality', quality]]);
      row++;
    });
    
    businessIndustries.forEach(industry => {
      settingsSheet.getRange(row, 1, 1, 2).setValues([['businessIndustry', industry]]);
      row++;
    });
    
    return ContentService.createTextOutput('Settings saved');
  }
  
  return ContentService.createTextOutput('Invalid request');
}

function updateOrInsertRow(sheet, uid, data) {
  // Ensure sheet has headers and hide UID column
  if (sheet.getLastRow() === 0) {
    const headers = sheet.getName() === 'All leads' 
      ? ['UID', 'SL No', 'Lead Mobile Number', 'Country', 'Place', 'Name', 'Lead Quality', 'Business Industry', 'Special Notes', 'Current Status', 'Forwarded to', 'Date & Time']
      : ['UID', 'SL No', 'Lead Mobile Number', 'Country', 'Place', 'Name', 'Lead Quality', 'Business Industry', 'Special Notes', 'Current Status', 'Date & Time'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Hide UID column (column A)
    sheet.hideColumns(1);
  }
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Find existing row with UID
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === uid) {
      // Update existing row
      sheet.getRange(i + 1, 1, 1, data.length).setValues([data]);
      renumberSlNumbers(sheet);
      return;
    }
  }
  
  // Find correct position to insert based on date (oldest to newest)
  const newDate = new Date(data[data.length - 1]); // Last column is date
  let insertRow = sheet.getLastRow() + 1; // Default to end
  
  for (let i = 1; i < values.length; i++) {
    const existingDate = new Date(values[i][values[i].length - 1]);
    if (newDate < existingDate) {
      insertRow = i + 1;
      break;
    }
  }
  
  // Insert row at correct position
  if (insertRow <= sheet.getLastRow()) {
    sheet.insertRowBefore(insertRow);
    sheet.getRange(insertRow, 1, 1, data.length).setValues([data]);
  } else {
    sheet.appendRow(data);
  }
  
  // Renumber SL numbers
  renumberSlNumbers(sheet);
}

function deleteRowByUid(sheet, uid) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  console.log('Searching in sheet:', sheet.getName());
  console.log('Looking for UID:', uid);
  
  // Find and delete row with UID (first column)
  for (let i = 1; i < values.length; i++) {
    console.log('Row', i, 'first column:', values[i][0]);
    if (values[i][0] === uid) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function sortSheetByDate(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return;
  
  const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  dataRange.sort([{column: sheet.getLastColumn(), ascending: true}]);
  renumberSlNumbers(sheet);
}

function renumberSlNumbers(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return;
  
  const lastRow = sheet.getLastRow();
  for (let i = 2; i <= lastRow; i++) {
    sheet.getRange(i, 2).setValue(i - 1); // SL No is column 2
  }
}