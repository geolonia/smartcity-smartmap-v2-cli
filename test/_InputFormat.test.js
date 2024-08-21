const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');
const { isExist, getPath, parseYaml } = require('./testUtils');
const inputData = path.join(__dirname, 'data'); // データファイルのパス


describe('入力データのフォーマットについて', () => {

  test('レイヤー名とデータ参照先のファイル名が違ってもOK', async () => {

    const excel = [{
      '大カテゴリー': '',
      '中カテゴリー': '',
      'レイヤー名': '公衆無線LANアクセスポイント',
      'データ種別': 'geojson',
      'データ参照先': '公衆無線LAN'
    }]

    const util = new SmartMapUtil({
      config: excel,
      inputDir: inputData
    });

    await util.build();
    
  });

  test('geojson/shape/fiware 以外のデータを指定するとエラー', async () => {

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
      expect(e.message).toBe('データ種別は shape、geojson、fiware のいずれかを指定してください');
    }
  });

  test('データ参照先にURLを指定できるのは GeoJSON のみ', async () => {
    
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
  
  test('データ参照先に複数データを指定できない', async () => {
    
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
   * TODO: 
   * ・同じファイル名のテスト
   * ・同じメニュータイトル名のテスト
   * ・shape ファイルの crs が異なる場合のテストを追加
   */

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