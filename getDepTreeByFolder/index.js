const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Regular expressions to match .js and .ascx files in ASPX pages
const jsRegex = /src=["']<%#\s*GetVersionedUrl\(["']([^"']+\.js)["']\)\s*%>["']|src=["']([^"']+\.js)["']/gi;
const ascxRegex = /<%@\s*Register\s+.*?Src=["']([^"']+\.ascx)["']\s*%>/gi;

// Function to extract .js and .ascx dependencies from ASPX content
function extractDependencies(content) {
    const jsFiles = [...content.matchAll(jsRegex)].map(match => match[1]);
    const ascxFiles = [...content.matchAll(ascxRegex)].map(match => match[1]);
    return { jsFiles, ascxFiles };
}

// Function to traverse directory and process ASPX files
function traverseFolder(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            traverseFolder(filePath, fileList);
        } else if (path.extname(file) === '.aspx') {
            fileList.push(filePath);
        }
    });
    console.log({ fileList });
    return fileList;
}

// Function to add data to the Excel worksheet
function addFiles(wsData, aspxFile, jsFiles, ascxFiles) {
    const maxRows = Math.max(jsFiles.length, ascxFiles.length); // Determine how many rows to span
    for (let i = 0; i < maxRows; i++) {
        wsData.push([
            i === 0 ? aspxFile : '', // Add ASPX file name only once in the first row, empty for others
            jsFiles[i] || '',         // JavaScript file or empty if no more files
            ascxFiles[i] || ''        // ASCX file or empty if no more files
        ]);
    }
}

// Function to generate the Excel file
function generateExcel(data, outputFileName) {
    const wsData = [
        [{v: 'ASPX File', s: { font: { bold: true } }}, {v: 'JavaScript Files', s: { font: { bold: true } }}, {v: 'ASCX Files', s: { font: { bold: true } }}]
    ]; // First row with headers

    data.forEach(({ aspxFile, jsFiles, ascxFiles }) => {
        addFiles(wsData, aspxFile, jsFiles, ascxFiles);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Adjust column widths based on content
    const fitToColumn = (data) => data[0].map((_, i) => {
        const maxLength = data.map(row => (row[i] ? row[i].toString().length : 10))
                              .reduce((a, b) => Math.max(a, b), 10);
        return { wch: maxLength + 2 };
    });
    ws['!cols'] = fitToColumn(wsData);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dependencies');

    // Write the Excel file
    XLSX.writeFile(wb, outputFileName);
}

// Main function to process the folder and generate the Excel
function processFolder(folderPath, outputFileName) {
    const aspxFiles = traverseFolder(folderPath);
    const data = aspxFiles.map(aspxFile => {
        const content = fs.readFileSync(aspxFile, 'utf-8');
        const { jsFiles, ascxFiles } = extractDependencies(content);
        return { aspxFile: path.basename(aspxFile), jsFiles, ascxFiles };
    });

    generateExcel(data, outputFileName);
}

// Define the folder path and output Excel file name
const absolutePath = 'C:\\src\\iLevel-Viewpoint\\Application\\SourceCode\\WebSites\\ViewPoint\\ILP\\test_delete';
const folderPath = path.resolve(absolutePath);
console.log(folderPath) // Replace with your folder path
const outputFileName = 'dependencies_with_aspx_span.xlsx';

// Process the folder and generate the Excel file
processFolder(folderPath, outputFileName);

console.log('Excel file generated:', outputFileName);
