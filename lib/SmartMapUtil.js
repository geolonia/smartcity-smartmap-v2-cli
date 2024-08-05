const path = require('path');
const fs = require('fs');
const downloadFile = require("./downloadFile");
const shapeToGeoJSON = require("./shapeToGeoJSON");
const geojsonToMBTile = require("./geojsonToMBTile");
const configToMenuYAML = require("./configToMenuYAML");
const createTempDir = require("./tempDir");

class SmartMapUtil {

    config = {};
    inputDir = '';
    tmpDir = '';
    outputDir = '';
    mbtileName = 'smartcity.mbtiles';
    crs = 'EPSG:4326';

    constructor(initConfig) {

        if (!initConfig.config) {
            throw new Error('config is required');
        }

        this.config = initConfig.config;
        this.inputDir = initConfig.inputDir || path.join(__dirname, '..', 'data');
        this.crs = initConfig.crs || this.crs;
        this.outputDir = initConfig.outputDir || path.join(__dirname, '..');
        this.mbtileName = initConfig.mbtileName || this.mbtileName;
    }

    async build() {
        this.tmpDir = await createTempDir('geojsons-');

        await this.convertToGeoJSON();
        await this.createVectorTiles();
        await this.createMenuFile();

        console.log('処理が完了しました');
    }

    async convertToGeoJSON() {

        for (let i = 0; i < this.config.length; i++) {
            const data = this.config[i];

            if (!data['データ参照先']) {
                console.warn(`レイヤー名: ${data['レイヤー名']} のデータ参照先 が指定されていません`);
                continue;
            }

            const regex = /shape|geojson|fiware/i;
            if (!regex.test(data['データ種別'])) {
                throw new Error('データ種別は shape、geojson、fiware のいずれかを指定してください');
            }

            if(data['データ参照先'].match(/\r\n|\r|\n/)) {
                throw new Error('データ参照先には改行を含めることはできません');
            }

            // データ参照先の末尾にスペースがある場合は削除
            if(data['データ参照先'].match(/\s+$/)) {
                data['データ参照先'] = data['データ参照先'].trim();
            }

            /**
             *  GeoJSON が URL で指定されている場合はダウンロードする
             */
            if (data['データ種別'] === 'geojson') {

                let dataPath;

                if (data['データ参照先'].startsWith('http')) {
                    dataPath = path.join(this.tmpDir, `${data['レイヤー名']}.geojson`);
                    await downloadFile(data['データ参照先'], dataPath);
                } else {
                    // ローカルファイルの場合はコピー
                    const originalDataPath = path.join(this.inputDir, `${data['データ参照先']}.geojson`);
                    const copiedDataPath = path.join(this.tmpDir, `${data['データ参照先']}.geojson`);
                    await fs.promises.copyFile(originalDataPath, copiedDataPath);

                    dataPath = copiedDataPath;
                }
                
                this.config[i]['geojsonPath'] = dataPath;
            }

            /**
             *  Shape ファイルを GeoJSON に変換する
             */
            if (data['データ種別'] === 'shape') {

                if (data['データ参照先'].startsWith('http')) {
                    throw new Error('Shape ファイルはローカルファイルのみ対応しています');
                }

                const dataPath = path.join(this.tmpDir, `${data['データ参照先']}.geojson`);
                const shapePath = path.join(this.inputDir, `${data['データ参照先']}.shp`);
                await shapeToGeoJSON(shapePath, dataPath, this.crs);

                this.config[i]['geojsonPath'] = dataPath;
            }
        }
    }

    async createVectorTiles() {
        const mbtilePath = path.join(this.outputDir, this.mbtileName);
        await geojsonToMBTile(this.config, this.tmpDir, mbtilePath);
    }

    async createMenuFile() {
        const menuPath = path.join(this.outputDir, 'menu.yml');
        configToMenuYAML(this.config, menuPath);
    }
}

module.exports = SmartMapUtil;