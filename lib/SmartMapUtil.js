const parse  = require("./parseExcel");
const downloadFile = require("./downloadFile");


class SmartMapUtil {

    config = {};
    dataDir = '';
    crs = 'EPSG:4326';

    constructor(initConfig) {

        if (!initConfig.configFilePath) {
            throw new Error('configFilePath is required');
        }

        this.config = parse(initConfig.configFilePath);
        this.dataDir = initConfig.dataDir;
        this.crs = initConfig.crs || this.crs;
    }

    async convertToGeoJSON() {

        for (let i = 0; i < this.config.length; i++) {
            const data = this.config[i];

            if (!data['データ参照先']) {
                console.warn(`レイヤー名: ${data['レイヤー名']} のデータ参照先 が指定されていません`);
                continue;
            }

            const dataDir = path.join(this.dataDir, `${data['レイヤー名']}.geojson`);
            /**
             *  GeoJSON が URL で指定されている場合はダウンロードする
             * 
             * TODO: 以下をテストに追加する
             * ・URLの指定は GeoJSON ファイルのみ
             * ・1レイヤーにつき1つのファイル
             * ・geojson をローカルファイルで指定した場合のエラー処理は tippecanoe に任せる？
             * ・shape ファイルの crs が異なる場合は対応していない
             */
            if (data['データ種別'] === 'geojson') {

                if (data['データ参照先'].startsWith('http')) {
                    await downloadFile(data['データ参照先'], dataDir);
                }
            }

            /**
             *  Shape ファイルを GeoJSON に変換する
             */
            if (data['データ種別'] === 'shape') {
                await shapeToGeoJSON(data['データ参照先'], dataDir, this.crs);
            }
        }
    }

    async createVectorTiles(config) {
        console.log('createVectorTiles');
    }
    async createMenuYAML(config) {
        console.log('createMenuYAML');
    }
}

module.exports = SmartMapUtil;