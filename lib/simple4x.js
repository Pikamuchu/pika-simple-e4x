'use strict';

var e4x = require('./e4xService');

/**
 * Main E4X XML class.
 * @param {string} xmlString - xml string to parse.
 */
function XML(xmlString) {
  return e4x.parseXmlString(xmlString);
}

module.exports = XML;
