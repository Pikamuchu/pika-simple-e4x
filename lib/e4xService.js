'use strict';

var base = require('./e4xBase');
var utils = require('./e4xUtils');

/**
 * XML node class.
 * @param {Object} node
 */
function XMLNode(node, name) {
  base.XMLBase.call(this, node, name);
  // Class properties
  this[0] = this;
  this.__length = 1;
  this.__class = 'XMLNode';
  // Class methods
  this._children = function() {
    var elements = utils.objectValues(this);
    return new XMLList(elements);
  };
  this._elements = function() {
    return this.children();
  };
  this._elementsNames = function() {
    return utils.objectKeys(this);
  };
  this._attributesNames = function() {
    return utils.objectKeys(this.$);
  }
  this._appendChild = function(child) {
    var node = parseXMLChild(child);
    if (this[node.__name] && this[node.__name]._appendChild) {
      this[node.__name]._appendChild(node);
    } else {
      this[node.__name] = node;
    }
    return this;
  };
  this._length = function() {
    return 1;
  };
  base.createPublicMethodsIfNoDataConfict(this);
}

/**
 * XML list class.
 * @param {Array} array
 */
function XMLList(array, name) {
  base.XMLBase.call(this, array, name);
  // Class properties
  this.__length = array.length || 0;
  this.__class = 'XMLList';
  // Class methods
  this._get = function(prop) {
    var result = '';
    this.toArray().forEach(function (node) {
      result += node._get(prop)
    });
    return result;
  };
  this._set = function(prop, value){
    this.toArray().forEach(function (node) {
      node._set(prop, value)
    });
  };
  this._appendChild = function(child) {
    var node = parseXMLChild(child);
    this[this.__length] = node;
    this.__length++;
    return this;
  };
  this._attribute = function(name) {
    return this.toArray().map(function(node) {
      return node._attribute(name);
    }).join('');
  };
  this._length = function() {
    return this.__length;
  };
  this.toArray = function() {
    return utils.objectAssign([], this);
  };
  this.toXMLString = function() {
    var node = {};
    node[this.__name] = this;
    return base.toXMLString(new XMLNode(node, this.__name + 's'));
  };
  base.createPublicMethodsIfNoDataConfict(this, 'XMLList');
}

/**
 * Parse the xml string to E4X object
 *
 * @param {string} xmlString
 */
function parseXmlString(xmlString) {
  var result = base.parseXmlString(xmlString, result);
  var xml;
  for (var node in result) {
    xml = processXMLNodes(result[node], node);
    xml.__isRoot = true;
  }
  return xml;
}

function processXMLNodes(obj, nodeName) {
  if (utils.isObject(obj)) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property) && property !== '$' && property !== '_') {
        var prop = obj[property];
        if (utils.isObject(obj)) {
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
  if (utils.isXMLNode(prop) || utils.isXMLList(prop)) {
    result = prop;
  } else if (utils.isObject(prop)) {
    result = new XMLNode(prop, nodeName);
  } else if (utils.isArray(prop)) {
    result = parseXMLArrayProperty(prop, nodeName);
  } else {
    result = new XMLNode({_: '' + prop}, nodeName);
  }
  return result;
}

function parseXMLArrayProperty(prop, nodeName) {
  var result = new XMLList(prop, nodeName);
  for (var index in result) {
    if (utils.isArrayProperty(index)) {
      result[index] = processXMLNodes(result[index], nodeName);
    }
  }
  return result;
}

function parseXMLChild(child) {
  return (utils.isXMLNode(child) || utils.isXMLList(child))
    ? child
    : parseXmlString('' + child);
}

module.exports = {
  XMLNode: XMLNode,
  XMLList: XMLList,
  parseXmlString: parseXmlString,
};
