const axios = require("axios");

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const endpoint =
  "https://api.stack-ai.com/inference/v0/run/50bdde64-2744-4e08-a623-d4c6624348b9/66b18335cca58cf680e8e07e";

const headers = {
  Authorization: "Bearer acda1312-1f44-415e-9d7e-188bb20eee3e",
  "Content-Type": "application/json",
};

module.exports = {
  uuidv4,
  endpoint,
  headers,
};
