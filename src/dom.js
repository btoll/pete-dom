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

const dom = {
    /**
     * `options` can be either an Object or a Boolean (useCapture).
     * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     */
    event: {
        add: (element, type, handler, options) =>
            element.addEventListener(type, handler, options),

        remove: (element, type, handler, options) =>
            element.removeEventListener(type, handler, options)
    },

    // https://jsperf.com/bt-dom-element-creation/edit
    /**
     * @function create
     * @param {object} obj
     * @param {boolean} returnDom optional
     * @return {element/HTMLElement}
     *
     * Dynamically create an elem and optionally append to a specified parent (and optionally have
     * that parent created if not already in the dom). Optionally provide an `attr` object, a `style`
     * object and an `items` array.
     *
     * Returns an element wrapper. If `returnDom` is `true`, returns an HTMLElement.
     * Note that you can pass any HTMLElement attribute in the `attr` object.
     *
     * @example
    dom.create({tag: 'ul',
        attr: {
            id: 'topLevel',
            cls: 'floater',
            onclick: fnHelloWorld //note you can reference a named function...;
            //onclick: function () { alert('hello, world!'); } //...or an anonymous function;
            //onclick: "alert('hello, world!');" //...or even a string;
        },
        style: {
            background: '#ffc',
            border: '1px solid #ccc',
            margin: '40px',
            padding: '20px'
        },
        items: [{
            tag: 'li',
            text: '<a href="#" onclick="alert(event); return false;">click me</a>',
            attr: {
                id: 'main',
                cls: 'expand'
            }
        }, {
            tag: 'li',
            attr: {
                cls: 'expand'
            },
            items: [{
                tag: 'a',
                attr: {
                    href: '#',
                    onclick: "alert('Hello, World!'); return false;",
                    innerHTML: 'No, click me!'
                }
            }]
        }],
        parent: document.body
    });

    ----------------------------------
    this would create a list like this
    ----------------------------------

    <ul style='border: 1px solid #ccc; margin: 40px; padding: 20px;
        background: #ffc;' class='floater' id='topLevel' onclick='fnHelloWorld();'>
        <li class='expand' id='main'>
            <a href='#' onclick='alert(event); return false;'>Click Me</a>
        </li>
        <li class='expand'>
            <a href='#' onclick='alert('Hello, World!'); return false;'>No, click me!</a>
        </li>
    </ul>
     */
    create: function (obj, returnDOM) {
        const id = obj.id;
        const el = core.create(Element, {
            dom: document.createElement(obj.tag),
            id: id
        });
        const d = el.dom;
        let o, alt, parent, item;

        // Pass id as either:
        //      attr: { id: 'Pete' }
        //  or
        //      id: 'Pete'
        if (id) {
            d.id = id;
        }

        if (obj.attr) {
            o = obj.attr;

            for (let prop of Object.keys(o)) {
                alt = prop;

                // NOTE html elements don't natively have 'on*' attribute.
                if (prop.indexOf('on') === 0) {
                    // NOTE ie6 can't handle i.setAttribute.
                    d[prop] = typeof o[prop] === 'function' ? o[prop] : new Function(o[prop]);
                } else {
                    if (prop === 'cls') {
                        alt = 'className';
                    }

                    d[alt] = o[prop];
                    //e.dom.setAttribute(prop, o[prop]);
                }
            }
        }

        if (obj.style) {
            o = obj.style;

            for (let prop of Object.keys(o)) {
                if (prop === 'float') {
                    d.style[!isIE ? 'cssFloat' : 'styleFloat'] = o[prop];
                    continue;
                }

                d.style[prop] = o[prop];
            }

        }

        // Pass text content as either:
        //      attr: { innerHTML: 'Pete' }
        //  or
        //      text: 'Pete'
        if (obj.text) {
            d.innerHTML = obj.text;
        }

        if (obj.items) {
            o = obj.items;

            for (let i = 0, len = o.length; i < len; i++) {
                item = o[i];

                if (!item.parent) {
                    item.parent = d;
                }

                dom.create(item);
            }
        }

        // The parent isn't in the DOM yet so create it and append all the items to it.
        if (obj.parent && obj.inDOM === false) {
            o = obj.parent;

            parent = typeof o === 'string' ?
                core.create(Element) :
                o;

            parent.appendChild(d);

            return returnDOM ?
                parent.d :
                parent;

        // If a parent elem was given and is already an existing node in the DOM append the node to it.
        } else if (obj.parent) {
            dom.getDom(obj.parent).appendChild(d);

            return returnDOM ?
                d :
                el;
        }
        // Else return the node to be appended later into the DOM.
        else {
            return returnDOM ?
                d :
                el;
        }
    },

    /**
     * @function Pete.dom.find
     * @param {String/HTMLElement/element} el
     * @param {String} selector
     * @return {HTMLElement/Boolean}
     *
     * This method finds an ancestor element of `el` by interrogating each of its parent elements using the passed selector.
     * Returns either the found dom element or `false`.
     *
     *      dom.find('test', '#box3[style$=100px;]');
     *
     */
    find: (el, selector) => {
        if (!el || !selector) {
            throw new Error('Failure to provide arguments in method Pete.dom.find');
        }

        el = Element.get(el, true).parentNode;

        while (el) {
            if (document.querySelector(selector)) {
                return el;
            }

            el = el.parentNode;
        }

        return false;
    },

    getDom: function (el, root) {
        if (!el) {
            return;
        }

        return el.dom ?
            el.dom :
            typeof el === 'string' ? (root || document).getElementById(el) : el;
    },

    /**
     * @function Pete.dom.insertAfter
     * @param {HTMLElement} newElement
     * @param {HTMLElement} targetElement
     * @return {None}
     *
     * Inserts `newElement` after `targetElement` in the DOM.
     * Use this helper method when not wanting to instantiate a `element` and thereby invoking `Element.after`.
     */
    insertAfter: (newElement, targetElement) => {
        const parent = targetElement.parentNode;

        if (parent.lastChild === targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    },

    /**
     * @function Pete.dom.insertHtml
     * @param {String} where Where to insert the html in relation to `elem` - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * @param {HTMLElement} elem
     * @param {String} html
     * @return {HTMLElement}
     *
     * Easily allows for inserting HTML in the document tree.
     * @example
    Example:

    <ul>
      <li>one</li>
      <li>two</li>
      <li>three</li>
      <li>four</li>
      <li>five</li>
    </ul>

    What if you need to append text to one of the list items?  innerHTML kills an element's
    children, and performing an operation to first retrieve the child node and then append
    the new text isn't convenient.

    var html = ' <strong>hundred</strong>';
    Pete.dom.insertHtml('beforeEnd', document.getElementsByTagName('li')[1], html);

    So the list becomes:

    <ul>
      <li>one</li>
      <li>two <strong>hundred</strong></li>
      <li>three</li>
      <li>four</li>
      <li>five</li>
    </ul>

    This is a simple example but the concept can easily be grasped.
     */
    insertHtml: (where, elem, html) => {
        where = where.toLocaleLowerCase();

        if (elem.insertAdjacentHTML) {
            switch (where) {
                case 'beforebegin':
                    elem.insertAdjacentHTML('BeforeBegin', html);
                    return elem.previousSibling;

                case 'afterbegin':
                    elem.insertAdjacentHTML('AfterBegin', html);
                    return elem.firstChild;

                case 'beforeend':
                    elem.insertAdjacentHTML('BeforeEnd', html);
                    return elem.lastChild;

                case 'afterend':
                    elem.insertAdjacentHTML('AfterEnd', html);
                    return elem.nextSibling;
            }

            throw 'Illegal insertion point -> "' + where + '"';
        }

        const range = elem.ownerDocument.createRange();
        let frag;

        switch (where) {
            case 'beforebegin':
                range.setStartBefore(elem);
                frag = range.createContextualFragment(html);
                elem.parentNode.insertBefore(frag, elem);
                return elem.previousSibling;

            case 'afterbegin':
                if (elem.firstChild) {
                    range.setStartBefore(elem.firstChild);
                    frag = range.createContextualFragment(html);
                    elem.insertBefore(frag, elem.firstChild);
                    return elem.firstChild;

                } else {
                    elem.innerHTML = html;
                    return elem.firstChild;
                }

                // The following return statement is so eslint doesn't complain!
                return;

            case 'beforeend':
                if (elem.lastChild) {
                    range.setStartAfter(elem.lastChild);
                    frag = range.createContextualFragment(html);
                    elem.appendChild(frag);
                    return elem.lastChild;

                } else {
                    elem.innerHTML = html;
                    return elem.lastChild;
                }

                // The following return statement is so eslint doesn't complain!
                return;

            case 'afterend':
                range.setStartAfter(elem);
                frag = range.createContextualFragment(html);
                elem.parentNode.insertBefore(frag, elem.nextSibling);
                return elem.nextSibling;
        }

        throw 'Illegal insertion point -> "' + where + '"';
    },

    /**
     * @function Pete.dom.isTextBox
     * @param {HTMLElement/element} elem
     * @return {Boolean}
     *
     * A handy way to quickly determine if an element is a textbox or a textarea.  Useful for string trimming and validation.
     *
     *      const oDom = Element.get(this, true);
     *      if (!Pete.dom.isTextBox(oDom)) return;
     *      oDom.value = dom.value();
     *      return this;
     *
     */
    isTextBox: elem => {
        elem = Element.get(elem, true);

        return elem.nodeName.toLocaleLowerCase() === 'input' &&
            elem.type === 'text' ||
            elem.nodeName.toLocaleLowerCase() === 'textarea';
    },

    /**
     * @function ready
     * @param {Function} fn
     * @param {Function} callback A callback that is called when the window.load event is fired.
     * @return {None}
     *
     * Should be the first statement called in any jsLite application. All code to be invoked at page
     * load should be within the function that is the sole argument.
     */
    ready: function (fn, callback) {
        document.addEventListener('DOMContentLoaded', fn, false);

        if (callback) {
            Element.fly(window).on('load', callback);
        }
    },

    /**
     * @function Pete.dom.remove
     * @param {String/Array} toRemove Can be either a single HTMLElement to remove or an Array of HTMLElements
     * @return {HTMLElement/Array} - One or more <code>HTMLElements</code>
     * Removes one or more `HTMLElements` from the DOM and returns the removed element(s).
     *
     * Use this helper method when not wanting to instantiate a `element` and thereby invoking `Element.remove`.
     *
     *      const oElems = Pete.dom.remove('test');
     *      const aElems = Pete.dom.remove(['test', 'anotherTest', 'oneMore']);
     *
     */
    remove: toRemove => {
        let removedElements, elem, i, len;

        if (!toRemove) {
            return false;
        }

        if (typeof toRemove === 'string') {
            elem = Pete.getDom(toRemove);

            if (elem) {
                return elem.parentNode.removeChild(elem);
            }

        } else if (toRemove.constructor === Array) {
            removedElements = [];

            for (i = 0, len = toRemove.length; i < len; i++) {
                elem = Pete.getDom(toRemove[i]);

                if (elem) {
                    removedElements.push(elem.parentNode.removeChild(elem));
                }
            }

            return removedElements;
        }
    },

    removeChildren: v => {
        // TODO: What is elem???
        let elem;

        // `v` can either be an array (remove multiple nodes at once) or an object or a string (only remove one node).
        if (v.constructor === Array) {
            for (let i = 0, len = v.length; i < len; i++) {
                Pete.getDom(v[i]).parentNode.removeChild(elem);
            }
        } else {
            Pete.getDom(v).parentNode.removeChild(elem);
        }
    }
};

export default dom;

