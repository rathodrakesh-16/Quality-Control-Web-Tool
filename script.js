// Cache DOM elements to reduce repeated queries
const tableCache = {
    dataTable: document.getElementById('dataTable'),
    dataTablePDM: document.getElementById('dataTablePDM'),
    classificationDetailsTable: document.getElementById('classificationDetailsTable'),
    toolTable: document.getElementById('toolTable'),
    pulldataBackupTable: document.getElementById('pulldataBackupTable'),
    pulldataBackupTablePDM: document.getElementById('pulldataBackupTablePDM')
};

// Store paste event listeners for cleanup
const pasteListeners = {};

function formatHeadingId(headingId) {
    let cleanNumber = headingId.replace(/ID:/g, '').replace(/[^0-9]/g, '');
    return cleanNumber.padStart(8, '0');
}

function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? match[0] : '';
}

function syncToClassificationDetails() {
    if (!tableCache.dataTable || !tableCache.classificationDetailsTable) {
        console.error('Required tables not found for syncToClassificationDetails.');
        return;
    }

    const scraperTbody = tableCache.dataTable.getElementsByTagName('tbody')[0];
    const classificationTbody = tableCache.classificationDetailsTable.getElementsByTagName('tbody')[0];
    if (!scraperTbody || !classificationTbody) {
        console.error('Table bodies not found for syncToClassificationDetails.');
        return;
    }

    const scraperRows = scraperTbody.rows;
    const maxRows = scraperRows.length;

    // Batch row addition
    if (maxRows > classificationTbody.rows.length) {
        const rowsToAdd = maxRows - classificationTbody.rows.length;
        addRow('classificationDetailsTable', rowsToAdd);
    }

    const classificationRows = classificationTbody.rows;
    for (let i = 0; i < maxRows; i++) {
        const classificationRow = classificationRows[i];
        const scraperRow = scraperRows[i];
        const inputs = {
            headingId: scraperRow.cells[1]?.querySelector('input'),
            headingName: scraperRow.cells[0]?.querySelector('input'),
            definition: scraperRow.cells[2]?.querySelector('input'),
            family: scraperRow.cells[3]?.querySelector('input'),
            pdmNum: scraperRow.cells[4]?.querySelector('input'),
            link: scraperRow.cells[5]?.querySelector('input')
        };
        const outputs = {
            headingId: classificationRow.cells[0].querySelector('input'),
            headingName: classificationRow.cells[1].querySelector('input'),
            family: classificationRow.cells[2].querySelector('input'),
            link: classificationRow.cells[3].querySelector('input'),
            pdmNum: classificationRow.cells[4].querySelector('input')
        };

        if (inputs.headingId?.value) {
            outputs.headingId.value = formatHeadingId(inputs.headingId.value);
        }
        if (inputs.headingName?.value) {
            outputs.headingName.value = inputs.headingName.value;
        }
        if (inputs.family?.value) {
            outputs.family.value = inputs.family.value;
        }
        if (inputs.link?.value) {
            outputs.link.value = inputs.link.value;
        }
        if (inputs.pdmNum?.value) {
            outputs.pdmNum.value = inputs.pdmNum.value;
        } else if (inputs.definition?.value) {
            const numberFromDefinition = extractNumber(inputs.definition.value);
            if (numberFromDefinition) {
                outputs.pdmNum.value = numberFromDefinition;
            }
        }
    }
}

function syncPDMText() {
    if (!tableCache.dataTablePDM || !tableCache.classificationDetailsTable) {
        console.error('Required tables not found for syncPDMText.');
        return;
    }

    const pdmTbody = tableCache.dataTablePDM.getElementsByTagName('tbody')[0];
    const classificationTbody = tableCache.classificationDetailsTable.getElementsByTagName('tbody')[0];
    if (!pdmTbody || !classificationTbody) {
        console.error('Table bodies not found for syncPDMText.');
        return;
    }

    const pdmRows = pdmTbody.rows;
    const classificationRows = classificationTbody.rows;
    const maxRows = Math.max(classificationRows.length, pdmRows.length);

    // Batch row addition
    if (maxRows > classificationRows.length) {
        const rowsToAdd = maxRows - classificationRows.length;
        addRow('classificationDetailsTable', rowsToAdd);
    }

    for (let i = 0; i < maxRows; i++) {
        const classificationRow = classificationTbody.rows[i];
        const pdmNumInput = classificationRow.cells[4]?.querySelector('input');
        const pdmTextInput = classificationRow.cells[5]?.querySelector('input');
        const pdmNumValue = pdmNumInput?.value?.trim() || '';

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
            const pdmNumSource = pdmRow.cells[0]?.querySelector('input')?.value?.trim() || '';
            const pdmTextSource = pdmRow.cells[2]?.querySelector('input')?.value || '';

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
    syncToClassificationDetails();
    syncPDMText();
    alert('Details generated successfully!');
}

function addRow(tableId, count = 1) {
    const table = tableCache[tableId]?.getElementsByTagName('tbody')[0];
    if (!table) return;

    const fragment = document.createDocumentFragment();
    let columns;

    if (tableId === 'dataTable' || tableId === 'pulldataBackupTable') {
        columns = ['headingName', 'headingId', 'definition', 'family', 'pdmNum', 'link', 'hos', 'updatedBy'];
    } else if (tableId === 'dataTablePDM' || tableId === 'pulldataBackupTablePDM') {
        columns = ['pdmNum', 'summary', 'pdmText', 'headingCount', 'date', 'updatedBy'];
    } else if (tableId === 'classificationDetailsTable') {
        columns = ['headingId', 'headingName', 'family', 'link', 'pdmNum', 'pdmText', 'headingType'];
    } else if (tableId === 'toolTable') {
        columns = ['input', 'output'];
    }

    for (let i = 0; i < count; i++) {
        const newRow = document.createElement('tr');
        columns.forEach(col => {
            const newCell = document.createElement('td');
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
            newRow.appendChild(newCell);
        });
        fragment.appendChild(newRow);
    }

    table.appendChild(fragment);
}

function addToolRow(count = 1) {
    const table = tableCache.toolTable?.getElementsByTagName('tbody')[0];
    if (!table) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const newRow = document.createElement('tr');
        const inputCell = document.createElement('td');
        const outputCell = document.createElement('td');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-cell';
        input.name = `input${table.rows.length + i}`;
        inputCell.appendChild(input);

        const output = document.createElement('input');
        output.type = 'text';
        output.className = 'output-cell';
        output.readOnly = true;
        outputCell.appendChild(output);

        newRow.appendChild(inputCell);
        newRow.appendChild(outputCell);
        fragment.appendChild(newRow);
    }

    table.appendChild(fragment);
}

function clearSheet(tableId, rowCount = 20) {
    const table = tableCache[tableId];
    if (!table) {
        console.error(`Table with ID ${tableId} not found.`);
        return;
    }
    const tbody = table.getElementsByTagName('tbody')[0];
    const originalClasses = tbody.className;

    // Remove existing paste event listener
    if (pasteListeners[tableId]) {
        table.removeEventListener('paste', pasteListeners[tableId]);
        delete pasteListeners[tableId];
    }

    tbody.innerHTML = '';
    tbody.className = originalClasses;

    // Add rows in bulk
    if (tableId === 'toolTable') {
        addToolRow(rowCount);
    } else {
        addRow(tableId, rowCount);
    }

    // Reattach paste event listener
    const pasteHandler = (event) => handlePaste(event, tableId);
    table.addEventListener('paste', pasteHandler);
    pasteListeners[tableId] = pasteHandler;

    alert(`Table ${tableId} has been cleared and reinitialized with ${rowCount} rows.`);
}

function exportToCSV(tableId) {
    const table = tableCache[tableId];
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    const csv = [];
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    csv.push(headers.join(','));
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('input').forEach(input => rowData.push(input.value || ''));
        csv.push(rowData.join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tableId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportCombinedCSV() {
    const pdmTable = tableCache.dataTablePDM;
    const scraperTable = tableCache.dataTable;
    if (!pdmTable || !scraperTable) return;

    const pdmHeaders = Array.from(pdmTable.querySelectorAll('thead th')).map(th => th.textContent);
    const scraperHeaders = Array.from(scraperTable.querySelectorAll('thead th')).map(th => th.textContent);
    const combinedHeaders = pdmHeaders.concat(scraperHeaders);

    const pdmRows = pdmTable.querySelectorAll('tbody tr');
    const scraperRows = scraperTable.querySelectorAll('tbody tr');
    const maxRows = Math.max(pdmRows.length, scraperRows.length);

    const csv = [combinedHeaders.join(',')];

    for (let i = 0; i < maxRows; i++) {
        const pdmRowData = [];
        const scraperRowData = [];

        if (i < pdmRows.length) {
            pdmRows[i].querySelectorAll('input').forEach(input => pdmRowData.push(input.value || ''));
        } else {
            pdmHeaders.forEach(() => pdmRowData.push(''));
        }

        if (i < scraperRows.length) {
            scraperRows[i].querySelectorAll('input').forEach(input => scraperRowData.push(input.value || ''));
        } else {
            scraperHeaders.forEach(() => scraperRowData.push(''));
        }

        const combinedRow = pdmRowData.concat(scraperRowData);
        csv.push(combinedRow.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scraperDataAfterwork_combined.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportCombinedCSVBackup() {
    const pdmTable = tableCache.pulldataBackupTablePDM;
    const scraperTable = tableCache.pulldataBackupTable;
    if (!pdmTable || !scraperTable) return;

    const pdmHeaders = Array.from(pdmTable.querySelectorAll('thead th')).map(th => th.textContent);
    const scraperHeaders = Array.from(scraperTable.querySelectorAll('thead th')).map(th => th.textContent);
    const combinedHeaders = pdmHeaders.concat(scraperHeaders);

    const pdmRows = pdmTable.querySelectorAll('tbody tr');
    const scraperRows = scraperTable.querySelectorAll('tbody tr');
    const maxRows = Math.max(pdmRows.length, scraperRows.length);

    const csv = [combinedHeaders.join(',')];

    for (let i = 0; i < maxRows; i++) {
        const pdmRowData = [];
        const scraperRowData = [];

        if (i < pdmRows.length) {
            pdmRows[i].querySelectorAll('input').forEach(input => pdmRowData.push(input.value || ''));
        } else {
            pdmHeaders.forEach(() => pdmRowData.push(''));
        }

        if (i < scraperRows.length) {
            scraperRows[i].querySelectorAll('input').forEach(input => scraperRowData.push(input.value || ''));
        } else {
            scraperHeaders.forEach(() => scraperRowData.push(''));
        }

        const combinedRow = pdmRowData.concat(scraperRowData);
        csv.push(combinedRow.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scraperDataBackup_combined.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handlePaste(event, tableId) {
    const table = tableCache[tableId]?.getElementsByTagName('tbody')[0];
    if (!table) return;

    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');

    let rows = pastedData.split('\n').map(row => row.split('\t'));

    const startCell = event.target.closest('td');
    const startRow = startCell?.parentElement;
    if (!startRow) return;

    const startRowIndex = Array.from(startRow.parentElement.children).indexOf(startRow);
    const startCellIndex = Array.from(startRow.children).indexOf(startCell);

    const fragment = document.createDocumentFragment();
    let rowsToAdd = 0;

    rows.forEach((row, rowIndex) => {
        if (!table.rows[startRowIndex + rowIndex]) {
            rowsToAdd++;
        }
    });

    if (tableId === 'toolTable') {
        addToolRow(rowsToAdd);
    } else {
        addRow(tableId, rowsToAdd);
    }

    rows.forEach((row, rowIndex) => {
        const currentRow = table.rows[startRowIndex + rowIndex];
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
    const tableIds = ['dataTable', 'dataTablePDM', 'classificationDetailsTable', 'pulldataBackupTable', 'pulldataBackupTablePDM', 'toolTable'];
    tableIds.forEach(tableId => {
        if (tableCache[tableId]) {
            if (tableId === 'toolTable') {
                addToolRow(20);
            } else {
                addRow(tableId, 20);
            }
            const pasteHandler = (event) => handlePaste(event, tableId);
            tableCache[tableId].addEventListener('paste', pasteHandler);
            pasteListeners[tableId] = pasteHandler;
        }
    });
}

function toggleTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const tableContainer = container.querySelector('.table-container');
    const toggleIcon = container.querySelector('.toggle-icon');

    if (tableContainer.style.maxHeight) {
        tableContainer.style.maxHeight = null;
        tableContainer.style.opacity = '1';
        toggleIcon.classList.remove('collapsed');
    } else {
        tableContainer.style.maxHeight = '0';
        tableContainer.style.opacity = '0';
        toggleIcon.classList.add('collapsed');
    }
}

function navigateToOtherTable(currentContainerId, targetContainerId) {
    const targetContainer = document.getElementById(targetContainerId);
    if (targetContainer) {
        targetContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setActiveToolButton(button) {
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

function spacingCheck() {
    const button = document.querySelector('button[onclick="spacingCheck()"]');
    setActiveToolButton(button);
    const rows = tableCache.toolTable?.querySelectorAll('tbody tr') || [];
    const whitespaceRegex = /\s{2,}|\t|\n/;

    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input?.value || '';
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
    const button = document.querySelector('button[onclick="removeSpace()"]');
    setActiveToolButton(button);
    const rows = tableCache.toolTable?.querySelectorAll('tbody tr') || [];
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input?.value?.trim().replace(/\s+/g, ' ') || '';
        outputCell.value = value;
        input.value = value;
    });
}

function wordCounter() {
    const button = document.querySelector('button[onclick="wordCounter()"]');
    setActiveToolButton(button);
    const rows = tableCache.toolTable?.querySelectorAll('tbody tr') || [];
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input?.value?.trim() || '';
        let output = '';
        if (value) {
            const words = value.split(/\s+/).filter(word => word.length > 0);
            output = `${words.length} word${words.length !== 1 ? 's' : ''}.`;
        }
        outputCell.value = output;
    });
}

function clearToolData() {
    const rows = tableCache.toolTable?.querySelectorAll('tbody tr') || [];
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        input.value = '';
        outputCell.value = '';
    });
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
}

async function linkCheck() {
    const button = document.querySelector('button[onclick="linkCheck()"]');
    setActiveToolButton(button);
    const rows = tableCache.toolTable?.querySelectorAll('tbody tr') || [];
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

    for (const row of rows) {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input?.value?.trim() || '';
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
    const button = document.querySelector('button[onclick="duplicatePDM()"]');
    setActiveToolButton(button);
    const rows = tableCache.toolTable?.querySelectorAll('tbody tr') || [];
    const values = Array.from(rows).map(row => row.querySelector('.input-cell')?.value?.trim().toLowerCase() || '');
    const duplicates = values.filter((item, index) => values.indexOf(item) !== index && item);
    rows.forEach(row => {
        const input = row.querySelector('.input-cell');
        const outputCell = row.querySelector('.output-cell');
        const value = input?.value?.trim() || '';
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
    document.getElementById('dateTimeSidebar').textContent = dateTimeString;
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

// Cleanup event listeners on page unloaded
window.onbeforeunload = function() {
    for (const tableId in pasteListeners) {
        if (pasteListeners[tableId] && tableCache[tableId]) {
            tableCache[tableId].removeEventListener('paste', pasteListeners[tableId]);
        }
    }
};
