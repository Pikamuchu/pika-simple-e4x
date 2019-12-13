'use strict';

var xml2js = require('xml2js');

/**
 * E4X XML class.
 * @param {string} xmlString - xml string to parse.
 */
function XML(xmlString) {
  var result = {};
  xml2js.parseString(
    xmlString,
    {
      explicitArray: false
    },
    function(err, res) {
      result = res;
    }
  );
  for (var root in result) {
    this.__proto__.__name = root;
    var resultRoot = result[root];
    for (var key in resultRoot) {
      this[key] = processXMLNodes(resultRoot[key], key);
    }
  }
  // Class methods
  this.toString = function() {
    return this.toXMLString();
  };
  this.toXMLString = function() {
    return toXMLString(this);
  };
}

/**
 * XMLNode class.
 * @param {Object} node
 */
function XMLNode(node, name) {
  objectAssign(this, node);
  // Class hidden properties
  this.__proto__.__name = name;
  // Class methods
  this.attribute = function(name) {
    return this.$ && this.$[name];
  };
  this.toString = function() {
    return this._ || this.toXMLString();
  };
  this.valueOf = function() {
    return this._ || this.toXMLString();
  };
  this.toObject = function() {
    return objectAssign({}, this);
  };
  this.toXMLString = function() {
    return toXMLString(this);
  };
}

/**
 * XMLList class.
 * @param {Array} array
 */
function XMLList(array, name) {
  objectAssign(this, array);
  // Class hidden properties
  this.__proto__.__name = name;
  this.__proto__.__length = array.length || 0;
  // Class methods
  this.length = function() {
    return this.__proto__.__length;
  };
  this.toString = function() {
    return this._ || this.toXMLString();
  };
  this.valueOf = function() {
    return this._ || this.toXMLString();
  };
  this.toArray = function() {
    return objectAssign([], this);
  };
  this.toXMLString = function() {
    var node = {};
    node[this.__name] = this;
    return toXMLString(new XMLNode(node, this.__name + 's'));
  };
}

function processXMLNodes(obj, nodeName) {
  if (isObject(obj)) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property) && property !== '$' && property !== '_') {
        var prop = obj[property];
        if (isObject(obj)) {
          processXMLNodes(prop, property);
        }
        obj[property] = parseXMLProperty(prop, property);
      }
    }
  }
  return parseXMLProperty(obj, nodeName);
}

function parseXMLProperty(prop, nodeName) {
  var result;
  if (isObject(prop)) {
    result = new XMLNode(prop, nodeName);
  } else if (isArray(prop)) {
    result = parseXMLListProperty(prop, nodeName);
  } else {
    result = prop;
  }
  return result;
}

function parseXMLListProperty(prop, nodeName) {
  var result = new XMLList(prop, nodeName);
  for (var index in result) {
    if (isArrayProperty(index)) {
      result[index] = processXMLNodes(result[index], nodeName);
    }
  }
  return result;
}

function toXMLString(source) {
  var obj = toXMLObject(source);
  var builder = new xml2js.Builder({
    headless: true,
    rootName: source.__name || 'root'
  });
  return builder.buildObject(obj);
}

function toXMLObject(source) {
  var obj = isArray(source) ? [] : {};
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      var sourceProp = source[prop];
      if (isXMLList(sourceProp)) {
        obj[prop] = toXMLObject(sourceProp.toArray());
      } else if (isXMLNode(sourceProp)) {
        obj[prop] = toXMLObject(sourceProp.toObject());
      } else if (isObject(sourceProp)) {
        obj[prop] = toXMLObject(sourceProp);
      } else if (!isFunction(sourceProp) && !isHiddenProp(prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
}

function isArrayProperty(index) {
  return !isNaN(index);
}

function isFunction(obj) {
  return obj != null && obj.constructor.name === 'Function';
}

function isObject(obj) {
  return obj != null && obj.constructor.name === 'Object';
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isXMLList(obj) {
  return obj != null && obj.constructor.name === 'XMLList';
}

function isXMLNode(obj) {
  return obj != null && obj.constructor.name === 'XMLNode';
}

function isHiddenProp(key) {
  return key.indexOf('__') === 0;
}

function objectAssign(target, source) {
  var to = Object(target);
  if (source != null) {
    for (var key in source) {
      if (!target.hasOwnProperty(key) && !isFunction(source[key]) && !isHiddenProp(key)) {
        target[key] = source[key];
      }
    }
  }
  return to;
}

module.exports = XML;
