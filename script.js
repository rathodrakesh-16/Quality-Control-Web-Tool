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
}

function syncPDMText() {
    const pdmTable = document.getElementById('dataTablePDM');
    const classificationTable = document.getElementById('classificationDetailsTable');
    
    const pdmRows = pdmTable.getElementsByTagName('tbody')[0].rows;
    const classificationRows = classificationTable.getElementsByTagName('tbody')[0].rows;

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

function generateDetails() {
    syncToClassificationDetails(); // Run first
    syncPDMText(); // Run second
    alert('Details generated successfully!');
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

function clearSheet(tableId, rowCount = 20) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error(`Table with ID ${tableId} not found.`);
        return;
    }
    if (!confirm('Are you sure you want to clear the table? This action cannot be undone.')) {
        return;
    }
    const tbody = table.getElementsByTagName('tbody')[0];
    const originalClasses = tbody.className;
    tbody.innerHTML = '';
    tbody.className = originalClasses;
    const rowsToAdd = [];
    for (let i = 0; i < rowCount; i++) {
        if (tableId === 'toolTable') {
            rowsToAdd.push(() => addToolRow());
        } else {
            rowsToAdd.push(() => addRow(tableId));
        }
    }
    rowsToAdd.forEach(add => add());
    alert(`Table ${tableId} has been cleared and reinitialized with ${rowCount} rows.`);
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

    let rows;
    if (['pulldataBackupTable', 'dataTablePDM', 'dataTable', 'classificationDetailsTable', 'toolTable'].includes(tableId)) {
        rows = pastedData.split('\n').map(row => row.split('\t'));
    } else {
        rows = pastedData.split('\n').map(row => row.split('\t')).slice(0, 20);
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
        defaultContent.style.display = 'none';
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
        for (let i = 0; i < 20; i++) {
            if (tableId === 'toolTable') {
                addToolRow();
            } else {
                addRow(tableId);
            }
        }
    });
}

function spacingCheck() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    const whitespaceRegex = /\s{2,}|\t|\n/;

    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value;
        let output = '';

        if (!value) {
            output = '';
        } else {
            const trimmedValue = value.trim();
            const issues = [];

            if (value !== trimmedValue) {
                if (value.startsWith(' ')) issues.push('leading space');
                if (value.endsWith(' ')) issues.push('trailing space');
            }

            if (whitespaceRegex.test(trimmedValue)) {
                const extraSpaces = (trimmedValue.match(/\s{2,}/g) || []).length;
                const tabs = (trimmedValue.match(/\t/g) || []).length;
                const newlines = (trimmedValue.match(/\n/g) || []).length;

                if (extraSpaces > 0) issues.push(`${extraSpaces} extra space${extraSpaces > 1 ? 's' : ''}`);
                if (tabs > 0) issues.push(`${tabs} tab${tabs > 1 ? 's' : ''}`);
                if (newlines > 0) issues.push(`${newlines} newline${newlines > 1 ? 's' : ''}`);
            }

            if (issues.length > 0) {
                output = `Issues: ${issues.join(', ')}`;
                outputCell.classList.add('error-text');
            } else {
                output = 'No spacing issues.';
                outputCell.classList.remove('error-text');
            }
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

async function linkCheck() {
    const rows = document.querySelectorAll('#toolTable tbody tr');
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

    for (const row of rows) {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input.value.trim();
        let output = '';

        if (!value) {
            output = '';
        } else if (!urlRegex.test(value)) {
            if (!value.match(/^https?:\/\//i)) {
                output = 'Missing http:// or https://';
            } else if (!value.match(/\.[a-zA-Z]{2,}$/i)) {
                output = 'Invalid or missing domain extension';
            } else {
                output = 'Invalid URL format';
            }
        } else {
            try {
                const url = new URL(value.startsWith('http') ? value : 'https://' + value);
                const hostname = url.hostname;

                if (hostname.length > 253) {
                    output = 'Domain name too long';
                } else if (!hostname.includes('.')) {
                    output = 'Invalid domain (no TLD)';
                } else {
                    if (!value.match(/^https?:\/\//i)) {
                        output = 'Valid URL missing HTTPS';
                    } else if (url.protocol === 'http:') {
                        output = 'Valid URL! (less secure has HTTP)';
                    } else {
                        output = 'Valid URL!';
                    }
                }
            } catch (e) {
                output = 'Invalid URL syntax';
            }
        }

        outputCell.value = output;
        if (output === 'Valid URL!') {
            outputCell.classList.remove('error-text');
        } else if (output) {
            outputCell.classList.add('error-text');
        } else {
            outputCell.classList.remove('error-text');
        }
    }
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
    
    const defaultContent = document.getElementById('defaultContent');
    if (defaultContent) {
        defaultContent.style.display = 'flex';
    }
};
