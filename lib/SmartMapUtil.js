const parse  = require("./parseExcel");


class SmartMapUtil {

    constructor(initConfig) {

        if (!initConfig.configFilePath) {
            throw new Error('configFilePath is required');
        }

        this.config = parse(initConfig.configFilePath);
        console.log(this.config);
    }

    async downloadFiles(config) {
        console.log('downloadFiles');
    }
    async convertToGeoJSON(config) {
        console.log('convertToGeoJSON');
    }
    async createVectorTiles(config) {
        console.log('createVectorTiles');
    }
    async createMenuYAML(config) {
        console.log('createMenuYAML');
    }
}

module.exports = SmartMapUtil;