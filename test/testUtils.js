const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const outputDir = path.join(__dirname, '..');
const getPath = (fileName) => path.join(outputDir, fileName);
const isExist = (fileName) => fs.existsSync(getPath(fileName));
const parseYaml = (fileName) => yaml.load(fs.readFileSync(getPath(fileName), 'utf8'));

module.exports = {
  getPath,
  isExist,
  parseYaml
};