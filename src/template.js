/**
 * Copyright (c) 2009 - 2017 Benjamin Toll (benjamintoll.com)
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

import { core } from 'pete-core';
import dom from './dom';
import element from './element';

/**
 * @function Template
 * @param {String} html A tokenized string of HTML that will define the template
 * @return {None}
 */
const template = {
    /**
     * @property re
     * @type RegExp
     * Constant. The regular expression against which the Template is applied.
     */
    re: /\{(\w+)\}/g,

    $extend: function () {
        const html = this.html;

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
    append: function (elem, values) {
        dom.insertHtml(
            'beforeEnd',
            element.get(elem, true),
            core.mixin(values)
        );
    },

    /**
     * @function apply
     * @param {Object/Array} values An object literal token map or an array
     * @return {String}
     *
     * Returns the Template (a String) with the values specified by values for the tokens.
     */
    apply: function (values) {
        return this.html.replace(this.re, (a, b) =>
            values[b]
        );
    }
};

export default template;

