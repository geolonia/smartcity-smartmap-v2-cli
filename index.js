const path = require('path');
const SmartMapUtil = require('./lib/smartMapUtil');
const { config } = require('process');

// データ階層ファイルのパス
const configFilePath = process.argv[2];
const smartMapInputPath = process.argv[3];
const smartMapOutputPath = process.argv[4];

const main = async () => {

    const smartMapUtil = new SmartMapUtil(
        {
            configFilePath: path.join(__dirname, configFilePath || 'smartcity-data.xlsx'),
            dataDir: path.join(__dirname, smartMapInputPath || 'data'),
            mbtilesPath: path.join(__dirname, smartMapOutputPath || 'smartcity-poc.mbtiles'),
        }
    );

    await smartMapUtil.downloadFiles(smartMapUtil.config);
    await smartMapUtil.convertToGeoJSON(smartMapUtil.config);
    await smartMapUtil.createVectorTiles(smartMapUtil.config);
    await smartMapUtil.createMenuYAML(smartMapUtil.config);
};

main();