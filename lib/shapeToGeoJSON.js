import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'child_process';

const shapeToGeoJSON = async (shpPath, outputDir, defaultCrs) => {
  // is .prj file present?
  let srsArgs = [];
  const prjPath = path.join(path.dirname(shpPath), path.basename(shpPath, path.extname(shpPath)) + '.prj');
  if (!fs.existsSync(prjPath)) {
    if (!defaultCrs) {
      throw new Error('shapefile の CRS が不明です。shapefile-default-crs にデフォルトの CRS を指定してください。');
    }
    srsArgs = ['-s_srs', defaultCrs];
  }

  const outputPath = path.join(outputDir, path.basename(shpPath, path.extname(shpPath)) + '.geojson');

  const ogrArgs = [
    ...srsArgs,
    '-t_srs', 'EPSG:4326', // GeoJSON assumes WGS84
    '-f', 'GeoJSON',
    outputPath,
    shpPath,
  ];

  // execを利用してコマンド実行
  await new Promise((resolve, reject) => {
    exec(`ogr2ogr ${ogrArgs.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`ogr2ogr の実行に失敗しました: ${stderr}`));
      }
      resolve();
    });
  });
}

module.exports = shapeToGeoJSON;
