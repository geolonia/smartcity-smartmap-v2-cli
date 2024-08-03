const fs = require('fs');
const path = require('path');


const createTempDir = async (keyword) => {
  await fs.promises.mkdir("tmp", { recursive: true });
  return await fs.promises.mkdtemp(path.join("tmp", keyword));
}

module.exports = createTempDir;