const path = require('path');
const fs = require('fs');
const parse  = require("./parseExcel");
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
    }

    async convertToGeoJSON() {

        for (let i = 0; i < this.config.length; i++) {
            const data = this.config[i];

            if (!data['データ参照先']) {
                console.warn(`レイヤー名: ${data['レイヤー名']} のデータ参照先 が指定されていません`);
                continue;
            }

            /**
             *  GeoJSON が URL で指定されている場合はダウンロードする
             * 
             * TODO: 以下をテストに追加する
             * ・URLの指定は GeoJSON ファイルのみ
             * ・1レイヤーにつき1つのファイル
             * ・geojson をローカルファイルで指定した場合のエラー処理は tippecanoe に任せる？
             * ・shape ファイルの crs が異なる場合は対応していない
             * ・複数のhttpの指定には対応していない
             * ・1つのファイルの時に、レイヤー名と参照元が異なる場合に表示されない
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