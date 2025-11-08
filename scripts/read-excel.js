const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('datamemberkoperasi.xlsx');

console.log('📊 Excel File Analysis\n');
console.log('Sheet Names:', workbook.SheetNames);
console.log('');

// Analyze all sheets
workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📄 Sheet ${index + 1}: ${sheetName}`);
  console.log(`${'='.repeat(50)}`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`Total Rows: ${data.length}`);
  
  if (data.length > 0) {
    console.log('📋 Headers (Row 1):');
    console.log(data[0]);
    console.log('');
    
    if (data.length > 1) {
      console.log('📝 Sample Data (First 3 rows):');
      data.slice(1, 4).forEach((row, rowIndex) => {
        console.log(`\nRow ${rowIndex + 2}:`);
        if (data[0] && Array.isArray(data[0])) {
          data[0].forEach((header, i) => {
            console.log(`  ${header}: ${row[i]}`);
          });
        } else {
          console.log(`  Data: ${row}`);
        }
      });
    }
  } else {
    console.log('⚠️ Empty sheet');
  }
});

console.log('\n✅ Analysis complete!');
