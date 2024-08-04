const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const configToMenuYAML = (config, outputFile) => {
  const menu = {};

  config.forEach(item => {
    const { 大カテゴリー, 中カテゴリー, レイヤー名, データ参照先, データ種別, geojsonPath } = item;

    if (!menu[大カテゴリー]) {
      menu[大カテゴリー] = {};
    }

    if (!menu[大カテゴリー][中カテゴリー]) {
      menu[大カテゴリー][中カテゴリー] = [];
    }

    const existingLayer = menu[大カテゴリー][中カテゴリー].find(layer => Object.keys(layer)[0] === レイヤー名);
    const isFiware = データ種別 === 'fiware';
    const dataName = isFiware ? データ参照先 : path.basename(geojsonPath, '.geojson');
    
    if (existingLayer) {
      existingLayer[レイヤー名].include.push(dataName);
    } else {

      const newLayer = {
        [レイヤー名]: {
          include: [dataName]
        }
      };

      // Fiwareの場合はtypeを追加
      if (isFiware) {
        newLayer[レイヤー名].type = 'fiware';
      }
      
      menu[大カテゴリー][中カテゴリー].push(newLayer);
    }
  });

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