const blockfrost_api = process.env["BLOCKFROST_API_ASSET"];
const config = require("../config.json");
const XMLHttpRequest = require("xhr2");
const { hexIt } = require("../services/misc.js");
const project_id = process.env["BLOCKFROST_PROJECT_ID"];

function getStakeWalletDetails(tag, page) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open(
      "GET",
      config.endpoints.getStakeWalletDetails + "/" + tag + "/addresses/assets?page="+page
    );
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
  return promise;
}

function getWalletDetails(tag) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("GET", config.endpoints.getWalletDetails + "/" + tag);
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
  return promise;
}

function getAllAsset(tag) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open(
      "GET",
      config.endpoints.getAssets +
        "/8f80ebfaf62a8c33ae2adf047572604c74db8bc1daba2b43f9a65635" +
        hexIt(tag)
    );
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
  return promise;
}

function getBlockfrostAsset(tag) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open(
      "GET",
      config.endpoints.getAssets +
        "/8f80ebfaf62a8c33ae2adf047572604c74db8bc1daba2b43f9a65635" +
        hexIt(tag)
    );
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
  return promise;
}

module.exports = {
  getStakeWalletDetails,
  getBlockfrostAsset,
  getWalletDetails,
};
