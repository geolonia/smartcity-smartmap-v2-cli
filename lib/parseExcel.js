const XLSX = require('xlsx');

const parse = (filePath) => {
    // ヘッダーが1行目にある前提で読み込む
    // ヘッダーが key として使用される
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
}

module.exports = parse;