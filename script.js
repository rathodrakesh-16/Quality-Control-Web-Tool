function formatHeadingId(headingId) {
    let cleanNumber = headingId.replace(/ID:/g, '').replace(/[^0-9]/g, '');
    return cleanNumber.padStart(8, '0');
}

function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? match[0] : '';
}

function syncToClassificationDetails() {
    const scraperTable = document.getElementById('dataTable');
    const classificationTable = document.getElementById('classificationDetailsTable');
    
    const scraperRows = scraperTable.getElementsByTagName('tbody')[0].rows;
    const classificationRows = classificationTable.getElementsByTagName('tbody')[0].rows;

    // Allow dynamic row addition for dataTable (no limit, but sync all rows up to scraperRows.length)
    const maxRows = scraperRows.length;

    for (let i = 0; i < maxRows; i++) {
        if (i >= classificationRows.length) {
            addRow('classificationDetailsTable');
        }
        
        const classificationRow = classificationTable.getElementsByTagName('tbody')[0].rows[i];
        const scraperRow = scraperRows[i];
        const headingIdInput = scraperRow.cells[1].querySelector('input');
        const headingNameInput = scraperRow.cells[0].querySelector('input');
        const definitionInput = scraperRow.cells[2].querySelector('input');
        const familyInput = scraperRow.cells[3].querySelector('input');
        const pdmNumInput = scraperRow.cells[4].querySelector('input');
        const linkInput = scraperRow.cells[5].querySelector('input');
        
        if (headingIdInput.value) {
            classificationRow.cells[0].querySelector('input').value = formatHeadingId(headingIdInput.value);
        }
        if (headingNameInput.value) {
            classificationRow.cells[1].querySelector('input').value = headingNameInput.value;
        }
        if (familyInput.value) {
            classificationRow.cells[2].querySelector('input').value = familyInput.value;
        }
        if (linkInput.value) {
            classificationRow.cells[3].querySelector('input').value = linkInput.value;
        }

        if (pdmNumInput.value) {
            classificationRow.cells[4].querySelector('input').value = pdmNumInput.value;
        } else if (definitionInput.value) {
            const numberFromDefinition = extractNumber(definitionInput.value);
            if (numberFromDefinition) {
                classificationRow.cells[4].querySelector('input').value = numberFromDefinition;
            }
        }
    }
    syncPDMText();
}

function syncPDMText() {
    const pdmTable = document.getElementById('dataTablePDM');
    const classificationTable = document.getElementById('classificationDetailsTable');
    
    const pdmRows = pdmTable.getElementsByTagName('tbody')[0].rows;
    const classificationRows = classificationTable.getElementsByTagName('tbody')[0].rows;

    // Allow dynamic row addition for dataTablePDM and classificationDetailsTable (no limit)
    const maxRows = Math.max(classificationRows.length, pdmRows.length);

    for (let i = 0; i < maxRows; i++) {
        if (i >= classificationRows.length) {
            addRow('classificationDetailsTable');
        }
        const classificationRow = classificationRows[i] || classificationTable.getElementsByTagName('tbody')[0].rows[i];
        const pdmNumInput = classificationRow.cells[4].querySelector('input');
        const pdmTextInput = classificationRow.cells[5].querySelector('input');
        const pdmNumValue = pdmNumInput.value.trim();

        if (!pdmNumValue) {
            pdmTextInput.value = '';
            continue;
        }

        if (isNaN(pdmNumValue)) {
            pdmTextInput.value = 'This Heading does not have PDM';
            continue;
        }

        let found = false;
        for (let j = 0; j < pdmRows.length; j++) {
            const pdmRow = pdmRows[j];
            const pdmNumSource = pdmRow.cells[0].querySelector('input').value.trim();
            const pdmTextSource = pdmRow.cells[2].querySelector('input').value;

            if (pdmNumValue.toLowerCase() === pdmNumSource.toLowerCase()) {
                pdmTextInput.value = pdmTextSource;
                found = true;
                break;
            }
        }

        if (!found) {
            pdmTextInput.value = 'This PDM number does not have PDM text in Library';
        }
    }
}

function addRow(tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    let columns;
    if (tableId === 'dataTable') {
        columns = ['headingName', 'headingId', 'definition', 'family', 'pdmNum', 'link', 'hos', 'updatedBy'];
    } else if (tableId === 'dataTablePDM') {
        columns = ['pdmNum', 'summary', 'pdmText', 'headingCount', 'date', 'updatedBy'];
    } else if (tableId === 'classificationDetailsTable') {
        columns = ['headingId', 'headingName', 'family', 'link', 'pdmNum', 'pdmText', 'headingType'];
    } else if (tableId === 'pulldataBackupTable') {
        columns = ['headingName', 'headingId', 'definition', 'family', 'pdmNum', 'link', 'hos', 'updatedBy'];
    } else if (tableId === 'toolTable') {
        columns = ['input', 'output'];
    }

    columns.forEach(col => {
        const newCell = newRow.insertCell();
        const input = document.createElement('input');
        input.type = 'text';
        if (tableId === 'toolTable') {
            if (col === 'input') {
                input.className = 'input-cell';
            } else if (col === 'output') {
                input.className = 'output-cell';
                input.readOnly = true;
            }
        }
        input.name = col;
        newCell.appendChild(input);
    });

    if (tableId === 'dataTable') {
        syncToClassificationDetails();
    }
    if (tableId === 'classificationDetailsTable') {
        syncPDMText();
    }
}

function addToolRow() {
    const table = document.getElementById('toolTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const inputCell = newRow.insertCell();
    const outputCell = newRow.insertCell();
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-cell';
    input.name = `input${table.rows.length}`;
    inputCell.appendChild(input);
    
    const output = document.createElement('input');
    output.type = 'text';
    output.className = 'output-cell';
    output.readOnly = true;
    outputCell.appendChild(output);
}

function clearSheet(tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    for (let i = 0; i < 20; i++) {  // Changed from 15 to 20 for all specified tables, including toolTable
        if (tableId === 'toolTable') {
            addToolRow();
        } else if (['dataTable', 'dataTablePDM', 'classificationDetailsTable', 'pulldataBackupTable'].includes(tableId)) {
            addRow(tableId);
        } else {
            addRow(tableId);
        }
    }
}

function exportToCSV(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    const csv = [];
    rows.forEach(row => {
        const rowData = [];
        if (tableId === 'tools') {
            const input = row.querySelector('.input-cell').value;
            const output = row.querySelector('.output-cell').value;
            rowData.push(input || '');
            rowData.push(output || '');
        } else if (tableId === 'pulldataBackupTable') {
            row.querySelectorAll('input').forEach(input => rowData.push(input.value));
        } else {
            row.querySelectorAll('input').forEach(input => rowData.push(input.value));
        }
        csv.push(rowData.join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tableId}.csv`);
    document.body.appendChild(link);
    link.click();
}

function handlePaste(event, tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');

    // Handle pasting differently for all specified tables to allow dynamic row addition
    let rows;
    if (['pulldataBackupTable', 'dataTablePDM', 'dataTable', 'classificationDetailsTable', 'toolTable'].includes(tableId)) {
        rows = pastedData.split('\n').map(row => row.split('\t')); // No limit for these tables
    } else {
        rows = pastedData.split('\n').map(row => row.split('\t')).slice(0, 20); // Limit to 20 rows for other tables (none currently apply)
    }

    const startCell = event.target.closest('td');
    const startRow = startCell.parentElement;
    const startRowIndex = Array.from(startRow.parentElement.children).indexOf(startRow);
    const startCellIndex = Array.from(startRow.children).indexOf(startCell);

    rows.forEach((row, rowIndex) => {
        let currentRow = table.rows[startRowIndex + rowIndex];
        if (!currentRow) {
            if (tableId === 'toolTable') {
                addToolRow();
            } else {
                addRow(tableId);
            }
            currentRow = table.rows[startRowIndex + rowIndex];
        }
        row.forEach((cellData, cellIndex) => {
            const currentCell = currentRow.cells[startCellIndex + cellIndex];
            if (currentCell) {
                const input = currentCell.querySelector('input');
                if (input) {
                    input.value = cellData.trim();
                }
            }
        });
    });

    if (tableId === 'dataTable') {
        syncToClassificationDetails();
    }
    if (tableId === 'classificationDetailsTable') {
        syncPDMText();
    }

    event.preventDefault();
}

document.getElementById('dataTable').addEventListener('paste', (event) => handlePaste(event, 'dataTable'));
document.getElementById('dataTablePDM').addEventListener('paste', (event) => handlePaste(event, 'dataTablePDM'));
document.getElementById('classificationDetailsTable').addEventListener('paste', (event) => handlePaste(event, 'classificationDetailsTable'));
document.getElementById('toolTable').addEventListener('paste', (event) => handlePaste(event, 'toolTable'));
document.getElementById('pulldataBackupTable').addEventListener('paste', (event) => handlePaste(event, 'pulldataBackupTable'));

function showSheet(sheetId) {
    const sheets = document.querySelectorAll('.blank-sheet');
    sheets.forEach(sheet => sheet.style.display = 'none');
    const selectedSheet = document.getElementById(sheetId);
    if (selectedSheet) {
        selectedSheet.style.display = 'block';
    }
    const defaultContent = document.getElementById('defaultContent');
    if (defaultContent) {
        defaultContent.style.display = 'none'; // Hide default content when a sheet is shown
    }
    const buttons = document.querySelectorAll('.sidebar button');
    buttons.forEach(button => button.classList.remove('active'));
    const activeButton = document.querySelector(`.sidebar button[onclick="showSheet('${sheetId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function initializeTable() {
    ['dataTable', 'dataTablePDM', 'classificationDetailsTable', 'pulldataBackupTable', 'toolTable'].forEach(tableId => {
        const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
        for (let i = 0; i < 20; i++) {  // Changed from 15 to 20 for all specified tables, including toolTable
            if (tableId === 'toolTable') {
                addToolRow();
            } else {
                addRow(tableId);
            }
        }
    });
    syncPDMText();
}

function spacingCheck() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value.trim();
        let output = '';
        if (value.includes('  ')) {
            output = 'Contains extra spaces!';
        } else {
            output = 'No extra spaces.';
        }
        outputCell.value = output;
    });
}

function removeSpace() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value.trim().replace(/\s+/g, ' ');
        outputCell.value = value || '';
        input.value = value;
    });
}

function wordCounter() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value.trim();
        let output = '';
        if (value) {
            const words = value.split(/\s+/).filter(word => word.length > 0);
            output = `${words.length} word${words.length !== 1 ? 's' : ''}.`;
        }
        outputCell.value = output;
    });
}

function clearToolData() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        input.value = '';
        outputCell.value = '';
    });
}

function linkCheck() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    const urlRegex = /^(https?:\/\/[^\s]+)$/i;
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value.trim();
        let output = '';
        if (urlRegex.test(value)) {
            output = 'Valid URL!';
        } else if (value) {
            output = 'Not a valid URL.';
        }
        outputCell.value = output;
    });
}

function duplicatePDM() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    const values = Array.from(rows).map(row => row.querySelector('.input-cell').value.trim().toLowerCase());
    const duplicates = values.filter((item, index) => values.indexOf(item) !== index && item);
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value.trim();
        let output = '';
        if (duplicates.includes(value.toLowerCase()) && value) {
            output = 'Duplicate PDM found!';
        } else if (value) {
            output = 'No duplicate PDM.';
        }
        outputCell.value = output;
    });
}

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    });
    document.getElementById('dateTimeScraperData').textContent = dateTimeString;
    document.getElementById('dateTimeScraperPDM').textContent = dateTimeString;
    document.getElementById('dateTimeClassification').textContent = dateTimeString;
    document.getElementById('dateTimeQCReport').textContent = dateTimeString;
    document.getElementById('dateTimeTools').textContent = dateTimeString;
    document.getElementById('dateTimeBackup').textContent = dateTimeString;
}

window.onload = function() {
    initializeTable();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Show default content on load
    const defaultContent = document.getElementById('defaultContent');
    if (defaultContent) {
        defaultContent.style.display = 'flex'; // Ensure default content is visible initially
    }
};