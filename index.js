const path = require('path');
const SmartMapUtil = require('./lib/smartMapUtil');
const { config } = require('process');

// データ階層ファイルのパス
const configFilePath = process.argv[2];
const InputPath = process.argv[3];
const OutputPath = process.argv[4];

const main = async () => {

    const smartMapUtil = new SmartMapUtil(
        {
            configFilePath: path.join(__dirname, configFilePath || 'smartcity-data.xlsx'),
            dataDir: path.join(__dirname, InputPath || 'data'),
            mbtilesPath: path.join(__dirname, OutputPath || 'smartcity-poc.mbtiles'),
        }
    );

    await smartMapUtil.downloadFiles(smartMapUtil.config);
    await smartMapUtil.convertToGeoJSON(smartMapUtil.config);
    await smartMapUtil.createVectorTiles(smartMapUtil.config);
    await smartMapUtil.createMenuYAML(smartMapUtil.config);
};

main();