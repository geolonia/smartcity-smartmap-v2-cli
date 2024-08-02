const fs = require('fs');
const axios = require('axios');

const downloadFile = async (url, dataDir) => {

  const writer = fs.createWriteStream(dataDir);
  const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
  });
};

module.exports = downloadFile;