function doGet(e) {
  return handleFormSubmission(e);
}

function doPost(e) {
  return handleFormSubmission(e);
}

function handleFormSubmission(e) {
  try {
    const ss = SpreadsheetApp.openById('1sPo3Bh1GghroFG02C5rO3elhydZ94kpOPyNSExH9LM4');
    const sheet = ss.getSheetByName('Sheet2'); // Change to your sheet name

    const formData = e.parameter;

    // Get the headers from the first row of your sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Map form data to sheet headers
    const rowData = headers.map(header => formData[header] || '');

    // Append the data to the sheet
    sheet.appendRow(rowData);

    // Return a simple response
    return ContentService.createTextOutput("Form submitted successfully.");
  } catch (error) {
    Logger.log('Error in handleFormSubmission: ' + error);
    return ContentService.createTextOutput("Error submitting form.");
  }
}
