const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');
const { isExist, getPath, parseYaml } = require('./testUtils');
const inputData = path.join(__dirname, 'data'); // データファイルのパス


describe('未対応の入力形式', () => {

  test('データ種別にしていできるのは、geojson か shape のみ', async () => {

    const excel = [{
      '大カテゴリー': '',
      '中カテゴリー': '',
      'レイヤー名': 'AED設置場所',
      'データ種別': 'kml',
      'データ参照先': 'https://example.com/aed.shp'
    }]

    const util = new SmartMapUtil({
      config: excel,
      inputDir: inputData
    });

    try {
      await util.build();
    } catch (e) {
      expect(e.message).toBe('データ種別は shape か geojson を指定してください');
    }
  });

  test('GeoJSON の URL指定できる。Shapeはローカルファイルのみ対応', async () => {
    
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
      expect(e.message).toBe('Shape ファイルはローカルファイルのみ対応しています');
    }
  });
  
  test('改行で複数のファイルやURLを指定できない', async () => {
    
    const excel = [{
      '大カテゴリー': '',
      '中カテゴリー': '',
      'レイヤー名': '第一種中高層住居専用地域',
      'データ種別': 'shape',
      'データ参照先': '第一種中高層住居専用地域\n第一種低層住居専用地域(60_40)'
    }]

    const util = new SmartMapUtil({
      config: excel,
      inputDir: inputData,
    });

    try {
      await util.build();
    } catch (e) {
      expect(e.message).toBe('データ参照先には改行を含めることはできません');
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