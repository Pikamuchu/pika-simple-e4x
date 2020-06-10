'use strict';

function isArray(obj) {
  return Array.isArray(obj);
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
      if (!target.hasOwnProperty(key) && isValidObjectKey(key, source)) {
        target[key] = source[key];
      }
    }
  }
  return to;
}

function objectKeys(source) {
  var values = [];
  if (source != null) {
    for (var key in source) {
      if (key !== '$' && key !== '0' && isValidObjectKey(key, source)) {
        values.push(key);
      }
    }
  }
  return values;
}

function objectValues(source) {
  var values = [];
  if (source != null) {
    for (var key in source) {
      if (key !== '$' && key !== '0' && isValidObjectKey(key, source)) {
        values.push(source[key]);
      }
    }
  }
  return values;
}

function isValidObjectKey(key, source) {
  return !isFunction(source[key]) && !isHiddenProp(key);
}

module.exports = {
  isArray: isArray,
  isArrayProperty: isArrayProperty,
  isFunction: isFunction,
  isObject: isObject,
  isXMLNode: isXMLNode,
  isXMLList: isXMLList,
  isHiddenProp: isHiddenProp,
  objectAssign: objectAssign,
  objectKeys: objectKeys,
  objectValues: objectValues
};

