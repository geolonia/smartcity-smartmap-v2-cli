const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');
const { isExist, getPath, parseYaml } = require('./testUtils');
const inputData = path.join(__dirname, 'data'); // データファイルのパス


describe('未対応の入力形式', () => {


  test('URLの指定は GeoJSON ファイルのみ', async () => {
    
    const excel = [{
      '大カテゴリー': '',
      '中カテゴリー': '',
      'レイヤー名': 'AED設置場所',
      'データ種別': 'shape',
      'データ参照先': 'https://example.com/aed.shp'
    }]

    const util = new SmartMapUtil({
      config: excel,
      inputDir: inputData
    });

    try {
      await util.build();
    } catch (e) {
      expect(e.message).toBe('URLの指定は GeoJSON ファイルのみ');
    }
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