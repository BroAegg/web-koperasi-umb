const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('datamemberkoperasi.xlsx');

console.log('📊 Excel File Analysis\n');
console.log('Sheet Names:', workbook.SheetNames);
console.log('');

// Read first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`📄 Sheet: ${sheetName}`);
console.log(`Total Rows: ${data.length}`);
console.log('');

// Show headers (first row)
console.log('📋 Headers (Row 1):');
console.log(data[0]);
console.log('');

// Show first 3 data rows
console.log('📝 Sample Data (First 3 rows):');
data.slice(1, 4).forEach((row, index) => {
  console.log(`\nRow ${index + 2}:`);
  data[0].forEach((header, i) => {
    console.log(`  ${header}: ${row[i]}`);
  });
});

console.log('\n✅ Analysis complete!');
