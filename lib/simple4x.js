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
  // Class properties
  this[0] = this;
  this.__length = 1;
  // Class methods
  this._length = function() {
    return 1;
  };
  createPublicMethodsIfNoDataConfict(this);
}

/**
 * XML list class.
 * @param {Array} array
 */
function XMLList(array, name) {
  XMLBase.call(this, array, name);
  // Class properties
  this.__length = array.length || 0;
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
      return node.attribute(name);
    }).join('');
  };
  this._length = function() {
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
  createPublicMethodsIfNoDataConfict(this);
}

/**
 * Base XML class.
 * @param {Array} array
 */
function XMLBase(obj, name) {
  objectAssign(this, obj);
  // Class properties
  this.__name = name || obj.__name;
  // Class methods (not available if name conflicts with xml data)
  this._get = function(prop){
    return nodeGetter(this, prop)
  };
  this._set = function(prop, value){
    nodeSetter(this, prop, value);
  };
  this._appendChild = function(child) {
    var node = parseXMLChild(child);
    if (this[node.__name] && this[node.__name]._appendChild) {
      this[node.__name]._appendChild(node);
    } else {
      this[node.__name] = node;
    }
    return this;
  };
  this._attribute = function(name) {
    return this._get('@' + name);
  };
  this._name = function() {
    return this.__name || '';
  }
  this._text = function() {
    return (this._ && this._.trim()) || '';
  }
  this.toString = function() {
    return this.__isRoot
      ? this.toXMLString()
      : this._ || this.toXMLString();
  };
  this.valueOf = function() {
    return this.toObject();
  };
  this.toObject = function() {
    return toXMLObject(this);
  };
  this.toXMLString = function() {
    return toXMLString(this);
  };
}

function createPublicMethodsIfNoDataConfict(obj) {
  var doNothig = function () {};
  if (!obj.get) {
    obj.get = obj._get || doNothig;
  }
  if (!obj.set) {
    obj.set = obj._set || doNothig;
  }
  if (!obj.appendChild) {
    obj.appendChild = obj._appendChild || doNothig;
  }
  if (!obj.attribute) {
    obj.attribute = obj._attribute || doNothig;
  }
  if (!obj.length) {
    obj.length = obj._length || doNothig;
  }
  if (!obj.name) {
    obj.name = obj._name || doNothig;
  }
  if (!obj.text) {
    obj.text = obj._text || doNothig;
  }
}

function nodeGetter(node, prop) {
  if (prop.indexOf('@') === 0) {
    return (node.$ && node.$[prop.substring(1)]) || '';
  } else {
    return node[prop] || '';
  }
}

function nodeSetter(node, prop, value) {
  if (prop.indexOf('@') === 0) {
    if (!node.$) node.$ = {};
    node.$[prop.substring(1)] = value;
  } else {
    node[prop] = value;
  }
}

function parseXmlString(xmlString) {
  var result;
  xml2js.parseString(
    prepareXmlString(xmlString),
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
    xml.__isRoot = true;
  }
  return xml;
}

function prepareXmlString(xmlString) {
  var result = xmlString;
  if (xmlString.indexOf('/>,<') > -1) {
    result = xmlString.replace(/\/>,</g, '/><')
  }
  return result;
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
        if (prop === '0') {
          if (isArray(source)) {
            obj[prop] = toXMLObject(sourceProp.toObject());
          }
        } else {
          obj[prop] = toXMLObject(sourceProp.toObject());
        }
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
