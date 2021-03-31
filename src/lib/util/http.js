const http = require("http");
const https = require("https");

function requestUrl(url, token) {
  const options = token ? { headers: { Authorization: `token ${token}` } } : {};
  return new Promise((resolve, reject) => {
    (url.startsWith("https://") ? https : http)
      .get(url, options, response => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(`Status: ${response.statusCode}. ${response.statusMessage}`);
        }
        let chunks_of_data = [];
        response.on("data", fragments => chunks_of_data.push(fragments));
        response.on("end", () =>
          resolve(Buffer.concat(chunks_of_data).toString())
        );
      })
      .on("error", error => reject(error));
  });
}

async function getUrlContent(url, token = undefined) {
  try {
    return await requestUrl(url, token);
  } catch (error) {
    throw new Error(`Error getting ${url}. Error: ${error}`);
  }
}

module.exports = {
  getUrlContent
};
