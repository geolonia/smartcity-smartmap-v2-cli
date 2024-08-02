const fs = require('fs');
const path = require('path');
const axios = require('axios');

// GeoJSONファイルをダウンロードする関数
const downloadGeoJSON = async (url, dataDir) => {

  const writer = fs.createWriteStream(dataDir);
  const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
  });
};

// Tippecanoeオプションの生成
const generateLayerNames = (data, dataDir) => {

  const layers = [];
  for (const key in data) {
      const value = data[key];

      const isLayerName = typeof value === 'string' && value.endsWith('.geojson');

      // データの場合
      if (isLayerName) {
          const filename = `${key}.geojson`;
          layers.push({ layerName: key, url: value, filename, dataDir: path.join(dataDir, filename) });

      // カテゴリの場合
      } else if (typeof value === 'object') {
          layers.push(...generateLayerNames(value, dataDir));
      }
  }
  return layers;
};

// メニュー用YAMLを生成する関数
const generateMenuYAML = (data) => {
  for (const key in data) {

    if (typeof data[key] === 'object' && !Array.isArray(data[key])) {

      // オブジェクトの値が全て文字列の場合は配列に変換
      const objectValueIsString = Object.values(data[key]).every(value => typeof value === 'string');
      if (objectValueIsString) {
        // キーを配列に変換
        data[key] = Object.keys(data[key]);
      } else {
        generateMenuYAML(data[key]);
      }
    }
  }
  return data;
};

module.exports = {
  downloadGeoJSON,
  generateLayerNames,
  generateMenuYAML
};