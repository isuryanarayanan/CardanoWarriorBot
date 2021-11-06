function arrayRemove(arr, value) {
  // Removes value from array arr

  return arr.filter(function (ele) {
    return ele != value;
  });
}

function hexIt(str) {
  // Returns hex encoded value of string
  str = "CardanoWarrior" + str;
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += "" + str.charCodeAt(i).toString(16);
  }
  return hex;
}

function parseTagsFromString(str) {
  // takes a string and parse it into query tags
  var splittedStr = str.split(",");
  var verifiedTags = [];
  splittedStr.forEach((e) => {
    if (!isNaN(e)) {
      verifiedTags.push(parseInt(e));
    }
  });
  verifiedTags.forEach((e) => {
    if (e < 1 || e > 10000) {
      verifiedTags = arrayRemove(verifiedTags, e);
    }
  });

  return verifiedTags.splice(0, 3);
}
module.exports = { arrayRemove, hexIt, parseTagsFromString };
