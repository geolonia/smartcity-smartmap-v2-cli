const path = require('path');
const fs = require('node:fs');
const { promisify } = require('util');
const { exec: _exec } = require('child_process');
const exec = promisify(_exec);
const error = require('./error');

const isOgr2ogrInstalled = async () => {
  try {
    await exec('ogr2ogr --version');
    return true;
  } catch (error) {
    return false;
  }
};

const shapeToGeoJSON = async (shpPath, outputPath, defaultCrs) => {

  // ogr2ogr がインストールされているか確認
  if (!await isOgr2ogrInstalled()) {
    error('ogr2ogr がインストールされていません。');
  }

  // is .prj file present?
  let srsArgs = [];
  const prjPath = path.join(path.dirname(shpPath), path.basename(shpPath, path.extname(shpPath)) + '.prj');
  if (!fs.existsSync(prjPath)) {
    if (!defaultCrs) {
      error('shapefile の CRS が不明です。shapefile-default-crs にデフォルトの CRS を指定してください。');
    }
    srsArgs = ['-s_srs', defaultCrs];
  }

  let ogrArgs = [
    ...srsArgs,
    '-t_srs', 'EPSG:4326', // GeoJSON assumes WGS84
    '-f', 'GeoJSON',
    `"${outputPath}"`,
    `"${shpPath}"`
  ];

  // 引数をスペース区切り
  ogrArgs = ogrArgs.join(' ');
  await exec(`ogr2ogr ${ogrArgs}`);
}

module.exports = shapeToGeoJSON;
