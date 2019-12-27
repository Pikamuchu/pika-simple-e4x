'use strict';

var xml2js = require('xml2js');
var utils = require('./e4xUtils');

/**
 * Base XML class.
 * @param {Array} array
 */
function XMLBase(obj, name) {
  utils.objectAssign(this, obj);
  // Class properties
  this.__name = name || obj.__name;
  // Class methods (not available if name conflicts with xml data)
  this._get = function(prop){
    return nodeGetter(this, prop)
  };
  this._set = function(prop, value){
    nodeSetter(this, prop, value);
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

function parseXmlString(xmlString, result) {
  xml2js.parseString(prepareXmlString(xmlString), {
    explicitArray: false
  }, function (err, res) {
    result = res;
  });
  return result;
}

function prepareXmlString(xmlString) {
  var result = xmlString;
  if (xmlString.indexOf('/>,<') > -1) {
    result = xmlString.replace(/\/>,</g, '/><')
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
  var obj = utils.isArray(source) ? [] : {};
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      var sourceProp = source[prop];
      if (utils.isXMLList(sourceProp)) {
        obj[prop] = toXMLObject(sourceProp.toArray());
      } else if (utils.isXMLNode(sourceProp)) {
        if (prop === '0') {
          if (utils.isArray(source)) {
            obj[prop] = toXMLObject(sourceProp.toObject());
          }
        } else {
          obj[prop] = toXMLObject(sourceProp.toObject());
        }
      } else if (utils.isObject(sourceProp)) {
        obj[prop] = toXMLObject(sourceProp);
      } else if (!utils.isFunction(sourceProp) && !utils.isHiddenProp(prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
}

module.exports = {
  XMLBase: XMLBase,
  toXMLString: toXMLString,
  parseXmlString: parseXmlString,
  createPublicMethodsIfNoDataConfict: createPublicMethodsIfNoDataConfict,
};
