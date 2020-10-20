const http = require("http");
const https = require("https");

function requestUrl(url) {
  return new Promise((resolve, reject) => {
    (url.startsWith("https://") ? https : http).get(url, response => {
      let chunks_of_data = [];
      response.on("data", fragments => chunks_of_data.push(fragments));
      response.on("end", () =>
        resolve(Buffer.concat(chunks_of_data).toString())
      );
      response.on("error", error => reject(error));
    });
  });
}

async function getUrlContent(url) {
  try {
    return await requestUrl(url);
  } catch (error) {
    throw new Error(`Error getting ${url}. Error: ${error}`);
  }
}

module.exports = {
  getUrlContent
};
