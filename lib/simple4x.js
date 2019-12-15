'use strict';

var xml2js = require('xml2js');

/**
 * Main E4X XML class.
 * @param {string} xmlString - xml string to parse.
 */
function XML(xmlString) {
  return parseXmlString(xmlString);
}

/**
 * XML node class.
 * @param {Object} node
 */
function XMLNode(node, name) {
  XMLBase.call(this, node, name);
  // Class methods
  this.attribute = function(name) {
    return this.$ && this.$[name];
  };
}

/**
 * XML list class.
 * @param {Array} array
 */
function XMLList(array, name) {
  XMLBase.call(this, array, name);
  // Class hidden properties
  this.__length = array.length || 0;
  // Class methods
  this.length = function() {
    return this.__length;
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

/**
 * Base XML class.
 * @param {Array} array
 */
function XMLBase(obj, name) {
  objectAssign(this, obj);
  // Class hidden properties
  this.__name = name || obj.__name;
  // Class methods
  this.appendChild = function(child) {
    var node = parseXMLChild(child);
    this[node.__name] = node;
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

function parseXmlString(xmlString) {
  var result;
  xml2js.parseString(
    xmlString,
    {
      explicitArray: false
    },
    function(err, res) {
      result = res;
    }
  );
  var xml;
  for (var node in result) {
    xml = processXMLNodes(result[node], node);
  }
  return xml;
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
  if (isXMLNode(prop) || isXMLList(prop)) {
    result = prop;
  } else if (isObject(prop)) {
    result = new XMLNode(prop, nodeName);
  } else if (isArray(prop)) {
    result = parseXMLArrayProperty(prop, nodeName);
  } else {
    result = new XMLNode({_: '' + prop}, nodeName);
  }
  return result;
}

function parseXMLArrayProperty(prop, nodeName) {
  var result = new XMLList(prop, nodeName);
  for (var index in result) {
    if (isArrayProperty(index)) {
      result[index] = processXMLNodes(result[index], nodeName);
    }
  }
  return result;
}

function parseXMLChild(child) {
  return (isXMLNode(child) || isXMLList(child))
    ? child
    : parseXmlString('' + child);
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
