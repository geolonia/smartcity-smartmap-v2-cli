const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');

const config = path.join(__dirname, 'test_data/smartcity-data.xlsx'); // 設定ファイルのパス
const inputData = path.join(__dirname, 'test_data'); // データファイルのパス

describe('SmartMapUtil', () => {

  test('タイルとメニュー用ファイルを生成する', () => {

    const util = new SmartMapUtil({
      configPath: config,
      inputDir: inputData
    });

    util.build();

    const filePath = path.join(__dirname, 'smartcity.mbtiles');
    const fileExists = fs.existsSync(filePath);

    expect(fileExists).toBe(true);
  });

});