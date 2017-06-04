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
import Element from './element';
import Pete from './pete';

// Composite 'inherits' each function from Element's prototype object.
// Note that each 'inherited' function will return invoke() which
// will call each function as a method of Element.

const proto = {};
let name;

for (name in Element) {
    if (typeof Element[name] === 'function') {
        // TODO: Don't include $compose or else an exception will be thrown when trying to invoke .invoke on a Element!
        if (name !== '$extend') {
            Pete.wrap(proto, name);
        }
    }
}

const composite = core.create(proto, {
    isComposite: true,

    /**
     * @function $extend
     * @return {None}
     *
     * Shouldn't be called directly. To be called whenever a composite object is composed.
     */
    // TODO
    $extend: function () {
        this.el = core.create(Element, {
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
    getCount: function () {
        return this.elements.length;
    },

    /**
     * @function getFirst
     * @param {None}
     * @return {HTMLElement}
     *
     * Returns the first dom element in the composite.
     */
    getFirst: function () {
        return this.elements[0];
    },

    /**
     * @function getLast
     * @param {None}
     * @return {HTMLElement}
     *
     * Returns the last dom element in the composite.
     */
    getLast: function () {
        return this.elements[this.elements.length - 1];
    },

    /**
     * @function invoke
     * @param {String/HTMLElement} elem
     * @return {Element}
     *
     * Not to be called directly.
     */
    invoke: function (fn, args) {
        const el = this.el;
        const elements = this.elements;

        elements.forEach(dom => {
            el.dom = dom;

            // TODO: Better way?
            // We really do our best to not touch any object we don't own, but in this case we have
            // to stamp on an id (and it's better than creating a _pete object but the composite or
            // the Fly isn't the owner).
            if (!dom.id && !dom._pete) {
                dom.id = Pete.id();
            }

            Element[fn].apply(el, args);
        });

        // Let's support chaining composite methods.
        return this;
    }
});

export default composite;

