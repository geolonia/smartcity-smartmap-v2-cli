const path = require('path');
const fs = require('fs');
const downloadFile = require("./downloadFile");
const shapeToGeoJSON = require("./shapeToGeoJSON");
const geojsonToMBTile = require("./geojsonToMBTile");
const configToMenuYAML = require("./configToMenuYAML");
const { createTempDir, baseTmpPath } = require("./tempDir");
const uuid = require('uuid');


class SmartMapUtil {

    config = {};
    inputDir = '';
    tmpDir = '';
    outputDir = '';
    mbtileName = 'smartcity.mbtiles';

    constructor(initConfig) {

        if (!initConfig.config) {
            throw new Error('config is required');
        }

        this.config = initConfig.config;
        this.inputDir = initConfig.inputDir || path.join(__dirname, '..', 'data');
        this.crs = initConfig.crs;
        this.outputDir = initConfig.outputDir || path.join(__dirname, '..');
        this.mbtileName = initConfig.mbtileName || this.mbtileName;
    }

    async build() {

        await this.convertToGeoJSON();
        await this.createVectorTiles();
        await this.createMenuFile();

        await fs.promises.rm(baseTmpPath, { recursive: true });
        console.log('処理が完了しました');
    }

    async convertToGeoJSON() {

        this.tmpDir = await createTempDir('geojsons-');

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

            // 同名ファイルがある場合にエラーが出るので、uuidをつける
            const outputPath = path.join(this.tmpDir, `${data['タイルレイヤー名']}-${uuid.v4()}.geojson`);
            this.config[i]['geojsonPath'] = outputPath;

            /**
             *  GeoJSON が URL で指定されている場合はダウンロードする
             */
            if (data['データ種別'] === 'geojson') {

                if (data['データ参照先'].startsWith('http')) {
                    // URLの場合はダウンロード
                    const url = data['データ参照先'];
                    await downloadFile(url, outputPath);
                } else {
                    // ローカルファイルの場合はコピー
                    const localFilePath = path.join(this.inputDir, `${data['データ参照先']}.geojson`);
                    await fs.promises.copyFile(localFilePath, outputPath);
                }
            }

            /**
             *  Shape ファイルを GeoJSON に変換する
             */
            if (data['データ種別'] === 'shape') {

                if (data['データ参照先'].startsWith('http')) {
                    throw new Error('Shape ファイルはローカルファイルのみ対応しています');
                }

                const shapePath = path.join(this.inputDir, data['データ参照先']);
                await shapeToGeoJSON(shapePath, outputPath, this.crs);
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