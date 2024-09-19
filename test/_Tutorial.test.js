const { execSync } = require('child_process');
const path = require('path');

describe('基本的な使い方', () => {

  // テスト実行前に実行
  beforeEach(() => {
    // ファイルを削除
    deleteFiles();
  });

  // afterEach は各テストが終了するたびに実行される
  afterEach(() => {
    // ファイルを削除
    deleteFiles();
  });

  test('タイルとメニュー用ファイルを生成', async () => {
    // ディレクトリを取得
    const scriptPath = path.join(__dirname, '../main.sh');
    const dataPath = path.join(__dirname, 'data');
    const configPath = path.join(__dirname, 'config/basic.xlsx');
    execSync(`bash ${scriptPath} ${dataPath} ${configPath} EPSG:2446`);

    const mbtilesPath = path.join(__dirname, '../output.mbtiles');
    const menuPath = path.join(__dirname, '../menu.yml');

    // ファイルが生成されているか確認
    // mbtilesPath にファイルが生成されているか確認
    expect(() => {
      const stats = require('fs').statSync(mbtilesPath);
      expect(stats.isFile()).toBe(true);
    }).not.toThrow();

    // menuPath にファイルが生成されているか確認
    expect(() => {
      const stats = require('fs').statSync(menuPath);
      expect(stats.isFile()).toBe(true);
    }).not.toThrow();

  });
});

const deleteFiles = () => {
  const mbtilesPath = path.join(__dirname, '../output.mbtiles');
  const menuPath = path.join(__dirname, '../menu.yml');
  try {
    require('fs').unlinkSync(mbtilesPath);
  } catch (err) {
    // ファイルが存在しない場合は何もしない
  }
  try {
    require('fs').unlinkSync(menuPath);
  } catch (err) {
    // ファイルが存在しない場合は何もしない
  }    
}
