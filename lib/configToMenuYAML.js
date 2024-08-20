const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const configToMenuYAML = (config, outputFile) => {

  const menu = {};

  config.forEach(item => {
    const { 大カテゴリー, 中カテゴリー, レイヤー名, データ参照先, データ種別, geojsonPath } = item;

    const isFiware = データ種別 === 'fiware';
    const dataName = isFiware ? データ参照先 : path.basename(geojsonPath, '.geojson');

    // レイヤー名のみの場合
    if (!大カテゴリー && レイヤー名) {
      menu[レイヤー名] = {
        type: 'data',
        include: [dataName]
      };
      return;
    }

    if (!menu[大カテゴリー]) {
      menu[大カテゴリー] = { type: 'category', items: {} };
    }

    if (中カテゴリー) {
      if (!menu[大カテゴリー].items[中カテゴリー]) {
        menu[大カテゴリー].items[中カテゴリー] = { type: 'category', items: {} };
      }

      if (!menu[大カテゴリー].items[中カテゴリー].items[レイヤー名]) {
        menu[大カテゴリー].items[中カテゴリー].items[レイヤー名] = {
          type: 'data',
          include: []
        };
      }

      menu[大カテゴリー].items[中カテゴリー].items[レイヤー名].include.push(dataName);
    } else {
      if (!menu[大カテゴリー].items[レイヤー名]) {
        menu[大カテゴリー].items[レイヤー名] = {
          type: 'data',
          include: []
        };
      }

      menu[大カテゴリー].items[レイヤー名].include.push(dataName);
    }
  });

  console.log(JSON.stringify(menu, null, 2));

  // YAMLに変換
  const yamlStr = yaml.dump(menu, {
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true,
    quotingType: '"'
  });

  // ファイルに書き込み
  fs.writeFileSync(outputFile, yamlStr);
  console.log(`メニューファイルを ${outputFile} に出力しました。`);
}

module.exports = configToMenuYAML;