/*
 *
 * This module is used to help with the blockfrost API for cardano.
 * There is 3 methods which is exported off this module.
 *
 * - getStakeWalletDetails
 *
 *   This method takes a stake wallet address and uses it to make an
 *   API query to '/addresses/assets' which will return all the information
 *   about assets which the wallet holds.
 *
 * - getWalletDetails
 *
 *   This method uses a wallet address that starts with 'addr' and returns
 *   a promise containing the stake address for that wallet address
 *
 * - getBlockfrostAsset
 *
 *   This method uses the cardanowarrior policy id to return a warrior asset
 *   metadata from the blockchain.
 *
 */
const project_id = process.env["BLOCKFROST_PROJECT_ID"];
const config = require("../config.json");
const XMLHttpRequest = require("xhr2");
const { hexIt } = require("../services/misc.js");

function getStakeWalletDetails(tag, page) {
  // Stake wallet is passed in and the information about that wallets contents
  // are returned in a promise instance. Blockfrost only shows 100 assets per page
  // if the number of assets in a wallet exceeds that then it will be available in
  // the next page, The page variable is to determine which page to look for
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open(
      "GET",
      config.endpoints.getStakeWalletDetails +
        "/" +
        tag +
        "/addresses/assets?page=" +
        page
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
  // This method uses the wallet endpoint and a valid wallet address as parameter
  // to return the details of the wallet allongside its stake wallet address, which
  // is further used to get all assets belonging to that wallet
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

function getBlockfrostAsset(tag) {
  // This method uses the CardanoWarriors policy id to retrieve the warrior information
  // with the unique id of each warrior.
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
  getWalletDetails,
  getBlockfrostAsset,
};
