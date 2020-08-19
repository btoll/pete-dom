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

var _dom = _interopRequireDefault(require("./dom"));

var _element = _interopRequireDefault(require("./element"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @function Template
 * @param {String} html A tokenized string of HTML that will define the template
 * @return {None}
 */
var template = {
  /**
   * @property re
   * @type RegExp
   * Constant. The regular expression against which the Template is applied.
   */
  re: /\{(\w+)\}/g,
  $extend: function $extend() {
    var html = this.html;

    if (Array.isArray(html)) {
      this.html = html.join('');
    }
  },

  /**
   * @function append
   * @param {HTMLElement/element} elem
   * @param {Object/Array} values An object literal or an array, will contain a map for the tokens
   * @return {None}
   *
   * Appends the Template to the element referenced by `elem`. `values` will contain a map for the tokens.
   */
  append: function append(elem, values) {
    _dom.default.insertHtml('beforeEnd', _element.default.get(elem, true), _peteCore.core.mixin(values));
  },

  /**
   * @function apply
   * @param {Object/Array} values An object literal token map or an array
   * @return {String}
   *
   * Returns the Template (a String) with the values specified by values for the tokens.
   */
  apply: function apply(values) {
    return this.html.replace(this.re, function (a, b) {
      return values[b];
    });
  }
};
var _default = template;
exports.default = _default;