/**
 * Copyright (c) 2009 - 2020 Benjamin Toll (benjamintoll.com)
 *
 * This file is part of pete-dom.
 *
 * pete-dom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * pete-dom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with pete-dom.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _peteCore = require("pete-core");

var _element = _interopRequireDefault(require("./element"));

var _pete = _interopRequireDefault(require("./pete"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Composite 'inherits' each function from Element's prototype object.
// Note that each 'inherited' function will return invoke() which
// will call each function as a method of Element.
var proto = {};
var name;

for (name in _element.default) {
  if (typeof _element.default[name] === 'function') {
    // TODO: Don't include $compose or else an exception will be thrown when trying to invoke .invoke on a Element!
    if (name !== '$extend') {
      _pete.default.wrap(proto, name);
    }
  }
}

var composite = _peteCore.core.create(proto, {
  isComposite: true,

  /**
   * @function $extend
   * @return {None}
   *
   * Shouldn't be called directly. To be called whenever a composite object is composed.
   */
  // TODO
  $extend: function $extend() {
    this.el = _peteCore.core.create(_element.default, {
      dom: null
    });
  },

  /**
   * @function getCount
   * @param {None}
   * @return {Number}
   *
   * Returns the number of objects in the composite.
   */
  getCount: function getCount() {
    return this.elements.length;
  },

  /**
   * @function getFirst
   * @param {None}
   * @return {HTMLElement}
   *
   * Returns the first dom element in the composite.
   */
  getFirst: function getFirst() {
    return this.elements[0];
  },

  /**
   * @function getLast
   * @param {None}
   * @return {HTMLElement}
   *
   * Returns the last dom element in the composite.
   */
  getLast: function getLast() {
    return this.elements[this.elements.length - 1];
  },

  /**
   * @function invoke
   * @param {String/HTMLElement} elem
   * @return {Element}
   *
   * Not to be called directly.
   */
  invoke: function invoke(fn, args) {
    var el = this.el;
    var elements = this.elements;
    elements.forEach(function (dom) {
      el.dom = dom; // TODO: Better way?
      // We really do our best to not touch any object we don't own, but in this case we have
      // to stamp on an id (and it's better than creating a _pete object but the composite or
      // the Fly isn't the owner).

      if (!dom.id && !dom._pete) {
        dom.id = _pete.default.id();
      }

      _element.default[fn].apply(el, args);
    }); // Let's support chaining composite methods.

    return this;
  }
});

var _default = composite;
exports.default = _default;