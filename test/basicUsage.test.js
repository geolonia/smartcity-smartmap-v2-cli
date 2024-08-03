const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');
const { isExist, getPath } = require('./utils');

const config = path.join(__dirname, 'data/smartcity-data.xlsx'); // 設定ファイルのパス
const inputData = path.join(__dirname, 'data'); // データファイルのパス


describe('基本的な使い方', () => {

  test('タイルとメニュー用ファイルを生成する', async () => {

    const util = new SmartMapUtil({
      configPath: config,
      inputDir: inputData
    });

    await util.build();

    const tileExists = isExist('smartcity.mbtiles');
    const menuExists = isExist('menu.yml');

    expect(tileExists).toBe(true);
    expect(menuExists).toBe(true);
  });

  /**
   * テスト後に生成されたファイルを削除する
   */
  afterEach(() => {
    if (isExist('smartcity.mbtiles')) {
      fs.unlinkSync(getPath('smartcity.mbtiles'));
    }
    if (isExist('menu.yml')) {
      fs.unlinkSync(getPath('menu.yml'));
    }
  });


});