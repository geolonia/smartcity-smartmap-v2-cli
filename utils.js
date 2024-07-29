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

module.exports = {
  downloadGeoJSON,
  generateLayerNames
};