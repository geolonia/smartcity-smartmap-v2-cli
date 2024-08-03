const outputDir = path.join(__dirname, '..');
const getPath = (fileName) => path.join(outputDir, fileName);
const isExist = (fileName) => fs.existsSync(getPath(fileName));

module.exports = {
  getPath,
  isExist
};