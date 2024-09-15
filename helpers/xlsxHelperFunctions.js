// Function to merge ASPX file cells
function mergeAspxCells(ws, wsData) {
    const merges = [];

    let startRow = 1;
    let currentAspx = wsData[1][0]; // Get the first ASPX file

    for (let row = 2; row < wsData.length; row++) {
        if (wsData[row][0] !== '') { // New ASPX file
            if (row - startRow > 1) {
                merges.push({ s: { r: startRow, c: 0 }, e: { r: row - 1, c: 0 } }); // Merge previous ASPX file cells
            }
            startRow = row; // Set new start row for the next ASPX file
            currentAspx = wsData[row][0]; // Update current ASPX
        }
    }

    // Merge the last set of ASPX file cells
    if (wsData.length - startRow > 1) {
        merges.push({ s: { r: startRow, c: 0 }, e: { r: wsData.length - 1, c: 0 } });
    }

    ws['!merges'] = merges; // Set the merges for the worksheet
}


// Create styles for headers
function styleHeaders(ws) {
    const range = XLSX.utils.decode_range(ws['!ref']); // Get the range of the sheet

    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: C }); // Target header row (0th row)
        if (ws[cellRef]) {
            // Apply bold font style to headers
            ws[cellRef].s = {
                font: { bold: true }, // Make header text bold
                alignment: { horizontal: "center", vertical: "center" } // Center align the headers
            };
        }
    }
}

// Function to set column widths based on content
function fitToColumn(ws, data) {
    const colWidths = data[0].map((_, i) => {
        const maxLength = data.map(row => (row[i] ? row[i].toString().length : 10)) // Measure length of each column
            .reduce((a, b) => Math.max(a, b), 10);
        return { wch: maxLength + 2 }; // Add some padding for better fit
    });

    ws['!cols'] = colWidths; // Set column widths
}