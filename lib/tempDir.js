const fs = require('fs');
const path = require('path');
const baseTmpPath = path.join(__dirname, 'tmp');

const createTempDir = async (keyword) => {

  if (!fs.existsSync(baseTmpPath)) {

    await fs.promises.mkdir(baseTmpPath, { recursive: true });
  }
  return await fs.promises.mkdtemp(path.join(baseTmpPath, keyword));
}

module.exports = {
  createTempDir,
  baseTmpPath
};