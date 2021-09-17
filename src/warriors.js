const { BOT_TOKEN, project_id } = require("./config.json");
var XMLHttpRequest = require("xhr2");

var endpoints = {
  getAssets: "https://cardano-mainnet.blockfrost.io/api/v0/assets",
};

function getAssets(tag) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("GET", endpoints.getAssets);
    xhr.setRequestHeader("Content-Type", "Application/json");
    xhr.setRequestHeader("project_id", project_id);
    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      reject(xhr);
    };
    xhr.send(JSON.stringify(tag));
  });
  promise.then((data) => {
    console.log(data.response);
  });
  return promise;
}

getAssets((tag = 2222));
