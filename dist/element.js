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
// TODO: destroy function?
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _peteCore = require("pete-core");

var _pete = _interopRequireDefault(require("./pete"));

var _composite = _interopRequireDefault(require("./composite"));

var _dom = _interopRequireDefault(require("./dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

/**
* @function element
* @param None
* @return {element}
*/
var element = _peteCore.core.create(_peteCore.observer, function () {
  // Test for possible dom id:
  //      #?              - May begin with a '#'.
  //      [a-zA-Z]{1}     - Must begin with a letter.
  //      [a-zA-Z0-9_-]*  - After the first char may contain a letter, number, underscore or hyphen.
  var reDomId = /^#?[a-zA-Z]{1}[a-zA-Z0-9_-]*$/;
  var reToken = /\{([a-z]+)\}/gi;
  return {
    /**
     * @function $extend
     * @param {None}
     * @return {None}
     *
     * Is called whenever a element object is composed as part of the internal object creation functionality.
     * Any object inititialization logic can/should be placed in here.
     */
    $extend: function $extend() {
      var dom = this.dom;

      var id = this.id || _pete.default.id();

      this.id = id; // TODO: Do we want to poke this on here?

      if (dom && !dom._pete) {
        dom._pete = {
          ownerId: id
        };
      }
    },

    /**
     * @function addClass
     * @param {String} cls
     * @return {element}
     *
     * Adds a class to an element if it's not present.
     */
    addClass: function addClass(cls) {
      if (!this.hasClass(cls)) {
        this.dom.className += ' ' + cls;
      }

      return this;
    },

    /**
     * @function after
     * @param {element/HTMLElement/String} elem
     * @return {element}
     *
     * Inserts the new element after the parent in the DOM.
     */
    after: function after(elem) {
      var targetElement = this.dom;
      var newElement = element.get(elem, true);
      var parent = targetElement.parentNode;

      if (parent.lastChild === targetElement) {
        parent.appendChild(newElement);
      } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
      }

      return this;
    },

    /**
     * @function append
     * @param {element/HTMLElement/Array} elem
     * @return {element}
     *
     * Appends an element or HTMLElement or a collection of them to a parent. When appending
     * multiple elements, a document fragment is used for optimization.
     */
    append: function append(elem) {
      var fragment;

      if (Array.isArray(elem)) {
        fragment = document.createDocumentFragment();
        elem.forEach(function (v) {
          return fragment.appendChild(element.get(v, true));
        });
        this.dom.appendChild(fragment);
      } else {
        this.dom.appendChild(element.get(elem).dom);
      }

      return this;
    },

    /**
     * @function before
     * @param {element/HTMLELement/String} elem
     * @return {element}
     *
     * Inserts the new element before the parent in the DOM. Shortcut for the standard DOM API insertBefore method.
     */
    before: function before(elem) {
      this.dom.parentNode.insertBefore(element.get(elem, true));
      return this;
    },

    /**
     * @function closest
     * @param {String} elem
     * @return {element/Boolean}
     *
     * Finds the closest parent element that matches `elem`. Inspired by the jQuery method of the same name.
     * Returns Boolean `false` if no matching parent element is found.
     */
    closest: function closest(elem) {
      var parent = this.dom.parentNode;

      while (parent && parent.nodeName) {
        if (parent.nodeName.toLocaleLowerCase() === elem) {
          return element.get(parent);
        } else {
          parent = (_readOnlyError("parent"), parent.parentNode);

          if (parent === document) {
            return false;
          }
        }
      }
    },

    /**
     * @function contains
     * @param {element/HTMLElement} el
     * @return {Boolean}
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
     */
    contains: function contains(el) {
      return this.dom.contains(_dom.default.getDom(el));
    },

    /**
     * @function disable
     * @param {Boolean} cache (Optional)
     * @return {element}
     *
     *
     * If `cache` is true, a reference to each `HTMLElement` will be stored in `pete.disabled`.
     * Each element in the cache can then be accessed by its id attribute value.
     *
     * Usually, this isn't necessary and re-enabling the element (`element.enable`) will remove
     * the reference from the cache.
     *
     * Important: If disabling links, a `disabled` class is expected. The default class resides
     * in `jslite.css` but can be overridden by a user-defined stylesheet.
     *
     *
     *      const list = element.gets('#theList li');
     *      list.disable('disabled');
     *
     *      // A classname is not needed when disabling <input>s.
     *      const inputs = element.gets('#theForm input');
     *      inputs.disable();
     *
     */
    disable: function disable(cache) {
      var d = this.dom;
      var elem, remove;

      if (d.onclick) {
        d.originalHandler = d.onclick;
      }

      d.onclick = function () {
        return false;
      }; // If this element has a handler (W3C) in the cache then remove it.


      if (_pete.default.events[d.id]) {
        elem = _pete.default.events[d.id];
        remove = _pete.default.dom.event.remove;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = elem[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var i = _step.value;
            remove(d, i, elem[i]);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      if (d.nodeName.toLocaleLowerCase() === 'input') {
        d.disabled = true;
      } else {
        this.addClass('disabled');
      }

      if (cache) {
        _pete.default.disabled[d.id] = d;
      }

      return this;
    },

    /**
     * @function element.enable
     * @param {None}
     * @return {element}
     *
     * If the element is in the `pete.disabled` cache, it's removed.
     *
     *      list.enable();
     *
     *      // A classname is not needed when re-enabling <input>s.
     *      inputs.enable();
     *
     */
    enable: function enable() {
      var d = this.dom;
      var elem, add;

      if (d.originalHandler) {
        d.onclick = this.dom.originalHandler;
        d.originalHandler = null;
      } else {
        d.onclick = null;
      } // If this element has a handler (W3C) in the cache then readd it.


      if (_pete.default.events[d.id]) {
        elem = _pete.default.events[d.id];
        add = _pete.default.dom.event.add;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = elem[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var i = _step2.value;
            add(d, i, elem[i]);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      if (d.nodeName.toLocaleLowerCase() === 'input') {
        d.disabled = false;
      } else {
        this.removeClass('disabled');
      }

      if (_pete.default.disabled[d.id]) {
        delete _pete.default.disabled[d.id];
      }

      return this;
    },

    /**
     * @function fly
     * @param {HTMLElement/String} el
     * @return {element}
     *
     * For one-off operations. It's modeled on the flyweight design pattern.
     *
     * The first time this method is called it checks an internal property to see if an `element`
     * object has been created. If not, it creates one. If it exists, it's re-used. This is important
     * because the wrapper methods never change, and it's not necessary to keep creating new methods
     * for one-off operations. The element is swapped out and is accessible in the `dom` property.
     *
     * A use case would be when a one-time operation is needed to be performed on an element but a
     * reference to that element is not needed for future use. Re-using the flyweight object is highly
     * recommended for efficiency, as in most cases it's already been created.
     */
    fly: function () {
      var symbol = _pete.default.globalSymbol;
      var flyweight = {};
      return function (el) {
        if (!flyweight[symbol]) {
          flyweight[symbol] = _peteCore.core.create(element);
        }

        flyweight[symbol].dom = element.get(el, true);
        return flyweight[symbol];
      };
    }(),

    /**
     * @function getHeight
     * @return {String/Null}
     *
     * Gets the height of the element.  Returns the result of the lookup or `null`.
     * NOTE: this method doesn't support composite objects (`composite`).
     *
     *       this.tooltip.width = parseInt(element.fly(this.tooltip).getHeight(), 10);
     *
     */
    getHeight: function getHeight() {
      var height;

      if (this.dom === document.body) {
        height = Math.max(document.documentElement.offsetHeight, document.body.scrollHeight, document.documentElement.clientHeight) + 'px';
      } else {
        height = this.getStyle('height');
      }

      return height;
    },

    /**
     * @function getStyle
     * @param {String} name CSS property name
     * @return {String/Null}
     *
     * Supply a CSS property to lookup.  Returns the result of the lookup or `null`.
     * NOTE: this method doesn't support composite objects (`composite`).
     */
    getStyle: function getStyle(name) {
      // If the property exists in style[] then it's been set recently and is current.
      if (this.dom.style[name]) {
        return this.dom.style[name];
      } else if (document.defaultView && document.defaultView.getComputedStyle) {
        //w3c;
        var obj; // It uses the traditional 'text-align' style of rule writing instead of 'textAlign'.

        name = name.replace(/([A-Z])/g, '-$1');
        name = name.toLocaleLowerCase(); // Get the style object and get the value of the property if it exists.

        obj = document.defaultView.getComputedStyle(this.dom, '');
        return obj && obj.getPropertyValue(name); // IE and early versions of Opera.
      } else if (this.dom.currentStyle) {
        return this.dom.currentStyle[name]; // Otherwise, some other browser is being used.
      } else {
        return null;
      }
    },

    /**
     * @function getWidth
     * @return {String/Null}
     *
     * Gets the width of the element.  Returns the result of the lookup or `null`.
     * NOTE: this method doesn't support composite objects (`composite`).
     */
    getWidth: function getWidth() {
      var width;

      if (this.dom === document.body) {
        width = Math.max(document.body.scrollWidth, document.documentElement.clientWidth) + 'px';
      } else {
        width = this.getStyle('width');
      }

      return width;
    },

    /**
     * @function hasClass
     * @param {String} cls
     * @return {None}
     *
     * Note that wrapping classname in spaces means that a regexp isn't needed.
     *
     */
    hasClass: function hasClass(cls) {
      return cls && (' ' + this.dom.className + ' ').indexOf(' ' + cls + ' ') > -1;
    },

    /**
     * @function hide
     * @param {None}
     * @return {element}
     */
    hide: function hide() {
      this.dom.style.display = 'none';
      return this;
    },

    /**
     * @function next
     * @param {String} elem Optional
     * @param {Boolean} returnDOM Optional
     * @return {element/HTMLElement}
     *
     * Returns an element wrapper. If `returnDOM` is `true`, returns an HTMLElement.
     */
    next: function next(elem, returnDOM) {
      if (elem && typeof elem === 'boolean') {
        returnDOM = elem;
        elem = undefined;
      }

      var nextEl = element.get(this, true).nextSibling;
      return nextEl.nodeType === 1 ? returnDOM ? nextEl : element.fly(nextEl) : next.call(nextEl, elem, returnDOM);
    },

    /**
     * @function on
     * @param {String/Array} type The type of event, i.e. `click` or `change` or `['click', 'change']`
     * @param {Object} scope The scope in which the callback is called (Optional)
     * @param {Boolean} useCapture Specify event phase (defaults to bubble)
     * @return {None}
     *
     * Binds one or more event listeners to the element and adds it/them to the cache. If listening
     * to more than one type of event, pass the events as an array as the first argument.
     */
    on: function on(type, fn) {
      var useCapture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var d = this.dom;
      var id = d.id || d._pete.ownerId; // Probably better to call bind on the function in "userspace" before passing it to element.on.
      //             scope = scope || this;

      if (typeof type === 'string') {
        type = [type];
      }

      type.forEach(function (type) {
        _dom.default.event.add(d, type, fn, useCapture); // Create the object for each id.


        var arr = [];
        var o = null;

        if (!_pete.default.events[id]) {
          _pete.default.events[id] = {};
        }

        o = _pete.default.events[id]; // Within each id object store the handler for each event type.

        if (!o[type]) {
          o[type] = fn; // If there's more than one handler for a given type then create an array of the handlers and assign it to the type.
        } else {
          if (!Array.isArray(o[type])) {
            arr = (_readOnlyError("arr"), Array.from(o));
            arr.push(fn);
            o[type] = arr; // It's already been cast to an array.
          } else {
            o[type].push(fn);
          }
        }
      });
    },

    /**
     * @function parent
     * @param {String} elem Optional
     * @param {Boolean} returnDOM Optional
     * @return {element/HTMLElement}
     *
     * If no argument is given, return the element's parent. Else, return the first parent whose `nodeName`
     * matches the passed parameter.Returns an element wrapper. If `returnDOM` is `true`, returns an HTMLElement.
     *
     * Returns `false` if no parent is found.
     *
     *      const parent = element.get('#test p span').parent();
     *
     *      // Parent() returns an element by default.
     *      const parent = element.get('#test p span').parent('div').setStyle({
     *          background: 'red',
     *          fontFamily: 'arial'
     *      });
     *
     *      // Have parent() return the HTMLElement.
     *      const parent = element.get('#test p span').parent('div', true).style.background = 'red';
     */
    parent: function parent(elem, returnDOM) {
      var returnElement = function returnElement() {
        return returnDOM ? parentEl : element.get(parentEl);
      };

      var parentEl = element.get(this, true).parentNode;

      if (!parentEl) {
        throw new Error('Parent could not be found');
      }

      if (elem && typeof elem === 'boolean') {
        returnDOM = elem;
        elem = undefined;
      } //return parent.nodeType === 1 ? parent : parent.call(parent);


      if (parentEl.nodeType === 1) {
        if (elem && typeof elem !== 'boolean') {
          // A specific parent nodeName was passed in and the parent hasn't found it yet so keep recursing.
          if (parentEl.nodeName.toLocaleLowerCase() !== elem) {
            // This has to return the final value since it's recursive and we could be dealing with many
            // execution contexts by nature of it being a recursive function.
            return parent.call(parentEl, elem, returnDOM);
          } else {
            return returnElement();
          }
        } else {
          return returnElement();
        }
      } else {
        parent.call(parentEl, elem, returnDOM);
      }
    },

    /**
     * @function previous
     * @param {String} elem Optional
     * @param {Boolean} returnDOM Optional
     * @return {HTMLElement}
     *
     * Returns an element wrapper. If `returnDOM` is `true`, returns an HTMLElement.
     */
    previous: function previous(elem, returnDOM) {
      if (elem && typeof elem === 'boolean') {
        returnDOM = elem;
        elem = undefined;
      }

      var prev = element.get(this, true).previousSibling;

      if (!prev) {
        throw new Error('Previous sibling could not be found');
      }

      return prev.nodeType === 1 ? returnDOM ? prev : element.fly(prev) : previous.call(prev, elem, returnDOM);
    },

    /**
     * @function remove
     * @param {None/String/HTMLElement/element/Boolean} elem The element(s) to remove
     * @return {element/composite}
     *
     * Removes an HTMLElement from the DOM and stores it in the `pete.garbage` cache.
     *
     * This method can be used in the following ways:
     *
     *      - If no param is passed, the method removes itself.
     *      - If a non-Boolean param is passed, remove that specific HTMLElement from the DOM.
     *      - If the Boolean true is passed as the param, remove all children of the current element.
     *
     * Please note that since this method returns the object it's bound to to allow for method chaining,
     * the removed `HTMLElement` is not returned. Therefore, all removed elements are accessible via the
     * global `pete.garbage` cache by their id attribute values.
     *
     *      element.get('five').remove('two'); // Removes the element with the id 'two'.
     *      element.get('five').remove(true);  // Removes all children of element 'five'.
      *      // Later on in the code you need a reference to the removed element for whatever reason.
     *      const removedElement = pete.garbage['two'];
     */
    remove: function remove(elem) {
      var children, o;

      if (typeof elem === 'boolean' && elem) {
        children = this.dom.childNodes;

        for (var i = 0; children[i];) {
          // Remember a node list is a live list.
          children[i].parentNode.removeChild(children[i]);
        }
      } else {
        o = element.get(elem || this, true); //pete.garbage[o.id] = o.parentNode.removeChild(o);

        o.parentNode.removeChild(o);
      }

      return this;
    },

    /**
     * @function replaceClass
     * @param {String} newClass
     * @param {String} currentClass
     * @return {element}
     *
     * Swaps out the class or adds it if it doesn't exist.
     */
    replaceClass: function replaceClass(newClass, currentClass) {
      // Swap out the class or just add it if currentClass doesn't exist.
      if (this.hasClass(currentClass)) {
        this.dom.className = this.dom.className.replace(currentClass, newClass);
      } else {
        //this.dom.className += ' ' + newClass;
        this.addClass(newClass);
      }

      return this;
    },

    /**
     * @function removeClass
     * @param {String/Array} v
     * @return {element}
     *
     * Pass either one class or multiple classes as an array to be removed.
     */
    removeClass: function removeClass(v) {
      var dom = this.dom;
      v = Array.isArray(v) ? v : [v];

      for (var i = 0, len = v.length; i < len; i++) {
        if (this.hasClass(v[i])) {
          dom.className = dom.className.replace(v[i], '');
        }
      }

      return this;
    },

    /**
     * @function serialize
     * @param {None}
     * @return {String}
     *
     * Retrieves a form's `input`, `select` and `textarea` elements and gathers their values, delimiting them
     * by an ampersand into key-value pairs that can be then used in an HTTP POST method.
     */
    serialize: function serialize() {
      var arr = [];
      element.formElements(this).forEach(function (o) {
        outerLoop: switch (o.nodeName.toLocaleLowerCase()) {
          case 'input':
            switch (o.type) {
              case 'checkbox':
              case 'radio':
                if (!o.checked) {
                  break outerLoop;
                }

            }

          // Falls through.

          case 'select':
            if (o.type === 'select-multiple') {
              for (var i = 0, opts = o.options, len = opts.length; i < len; i++) {
                if (opts[i].selected) {
                  arr.push(encodeURIComponent(o.name) + '=' + encodeURIComponent(opts[i].value));
                }
              }

              break;
            }

          // Falls through.

          default:
            arr.push(encodeURIComponent(o.name) + '=' + encodeURIComponent(o.value));
        }
      });
      return arr.join('&');
    },

    /**
     * @function setStyle
     * @param {String/Object} prop
     * @param {String} value
     * @return {element}
     *
     * Pass either a single property and its corresponding value or a single argument that is an object of styles.
     */
    setStyle: function setStyle(prop, value) {
      if (typeof prop === 'string') {
        this.dom.style[prop] = value;
      } else if (prop.constructor === Object) {
        var _arr = Object.keys(prop);

        for (var _i = 0; _i < _arr.length; _i++) {
          var i = _arr[_i];
          this.dom.style[i] = prop[i];
        }
      }

      return this;
    },

    /**
     * @function show
     * @param {None}
     * @return {element}
     */
    show: function show() {
      this.dom.style.display = 'block';
      return this;
    },

    /**
     * @function textContent
     * @param {None}
     * @return {String}
     *
     * Uses either the Core DOM `textContent` property or Internet Explorer's proprietary
     * `innerText` property to retrieve all of the text nodes within an element node.
     */
    textContent: function textContent() {
      return document.addEventListener ? this.dom.textContent : this.dom.innerText;
    },

    /**
     * @function toggleClass
     * @param {String} classname
     * @return {element}
     *
     * Removes the class if the element already has it or adds it if it doesn't.
     */
    toggleClass: function toggleClass(classname) {
      if (this.hasClass(classname)) {
        this.removeClass(classname);
      } else {
        this.addClass(classname);
      }

      return this;
    },

    /**
     * @function trim
     * @param {String}
     * @return {String}
     *
     * Checks to see if the element is a text box. If it is, then it do a standard trim.
     */
    trim: function trim() {
      var dom = element.get(this, true);

      if (element.isTextBox(dom)) {
        dom.value = dom.value.trim();
      }

      return this;
    },

    /**
     * @function un
     * @param {String/Array} type The type of event
     * @param {Function} fn The callback function
     * @param {Boolean} useCapture Specify event phase (defaults to bubble)
     * @return {None}
     *
     * Unbinds one or more event listeners from the element and removes it/them from the cache.
     * If removing more than one type of event, pass the events as an array as the first argument.
     *
     *      // ...previous code...
     *      links.un('click', func);
     *
     *      - or -
     *
     *      links.un(['click', 'mouseover'], func);
     *
     */
    un: function un(type, fn, useCapture) {
      var _this = this;

      if (typeof type === 'string') {
        type = [type];
      }

      type.forEach(function (type) {
        _dom.default.event.remove(_this.dom, type, fn, useCapture);

        delete _pete.default.events[_this.dom._pete.ownerId][type];
      });
    },

    /**
     * @function value
     * @param {Mixed}
     * @return {element/Mixed}
     *
     * When acting as a getter, it will return the text content of the element (just the text, no HTML).
     * If operating on an `input` element, it will return the element's `value` property. When acting
     * as a setter, it will set the element's `innerHTML` property. If operating on an `input` element,
     * it will set the element's `value` property. Chaining is allowed when used as a setter.
     *
     *      element.gets("input").setStyle({background: "#CCC"}).value("test test i'm a test");
     *
     */
    value: function value(v) {
      if (v) {
        if (!element.isTextBox(this)) {
          this.dom.innerHTML = v;
        } else {
          this.dom.value = v;
        } // Allow for chaining.


        return this; // If getting, return the value.
      } else {
        return this.textContent() || this.dom.value;
      }
    },

    /**
     * @function element.get
     * @param {String/HTMLElement} elem Can be either the <code>id</code> of an existing element or a reference to an <code>HTMLElement</code>
     * @param {HTMLElement} root Optional, will default to <code>document</code>.
     * @param {Boolean} returnDOM Optional
     * @return {element/HTMLElement}
     *
     * Will only return a single element. This method accepts a CSS selector string. If multiple results are found, only the first is returned.
     * Returns an `element` wrapper. If `returnDOM` is `true`, returns an HTMLElement instead.
     */
    get: function () {
      var makeEl = function makeEl(dom, id) {
        var el; // We give up if the el doesn't have an id and there's no dom element in the document.

        if (!id && !dom) {
          return null;
        }

        id = id || dom._pete && dom._pete.ownerId; // See if el is cached. If so, we're done.
        // If not, create it and cache it.

        if (!(el = _pete.default.cache[id])) {
          el = _peteCore.core.create(element, {
            dom: dom,
            id: id
          });
          id = el.id;
          _pete.default.cache[id] = el; // Note that the _pete object will be stamped onto the HTMLElement in $compose if the
          // element is created with an HTMLElement.
          // Cache a data object on the HTMLElement where we can store internal library information.

          if (!dom._pete) {
            dom._pete = {};
          } // Cache the element id.


          dom._pete.ownerId = id;
        }

        return el;
      };

      return function (el, root, returnDOM) {
        var id, d;

        if (root && typeof root === 'boolean') {
          returnDOM = root;
          root = undefined;
        } // If it's an object we assume it's either an element or a HTMLElement.


        if (typeof el !== 'string') {
          // Exit if none of the above.
          if (!(d = _dom.default.getDom(el, root))) {
            return null;
          } // We were passed an HTMLElement.


          if (d === el) {
            // If the element has the same id as its dom element, then it must have been given one by the dev.
            // Note that dom.id will be an empty string if not set.
            el = makeEl(d, d.id);
          } // We were passed an element.
          else {
              id = el.id; // If it's not in the cache do so now.
              // Note that elements created directly (core.create) aren't put in the cache by default.

              if (!_pete.default.cache[id]) {
                // Ensure it has an id.
                id = id || _pete.default.id();
                _pete.default.cache[id] = el;
              }
            }
        } else {
          if (reDomId.test(el)) {
            // Note el will refer to a DOM id.
            // If we've gotten here and the el arg is an HTMLElement, we can safely assume that it has a valid id
            // since we've now determined that the passed string is a DOM id.
            //
            // If the element has the same id as its dom element, then it must have been given one by the dev.
            if (!(el = makeEl(_dom.default.getDom(el, root), el))) {
              return null;
            }
          } else {
            // This allows for passing a selector to the domQuery engine (via element.gets).
            // Pass along a third argument in case root is also passed.
            //
            // TODO: Using element.get here causes a Too Much Recursion error.
            // Note we don't cache composite objects!
            el = _peteCore.core.create(element, {
              dom: element.gets(el, root || true, true)[0]
            });
          }
        }

        return returnDOM ? el.dom : el;
      };
    }(),

    /**
     * @function gets
     * @param {String} selector
     * @param {HTMLElement} root Optional, will default to <code>document</code>.
     * @param {Boolean} returnDOM Optional
     * @return {composite/Array}
     *
     * Pass a selector as well as an optional context element. Returns an element wrapper.
     * If `returnDOM` is `true`, returns an HTMLElement.
     *
     * Uses the Selectors API (https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector).
     *
     *      const list = element.gets('div div#theDiv.foobar .foo');
     *      list.addClass('bar');
     *
     */
    gets: function gets(selector, root, returnDOM) {
      var a = [];
      var els;

      if (root && typeof root === 'boolean') {
        returnDOM = root;
        root = document;
      } // Some older browsers don't support the Selectors API and the Selectors API doesn't support negative
      // attribute selectors, i.e. #myElem[class!=foo].


      if (selector.indexOf('!') !== -1 || typeof document.querySelectorAll !== 'function') {
        els = _pete.default.domQuery.search(selector, root); //returns a live HTML collection;
      } else {
        // Use the Selectors API, it's faster and returns a static nodelist.
        els = (root || document).querySelectorAll(selector);
      } // TODO: make an array?


      for (var i = 0, len = els.length; i < len; i++) {
        a.push(els[i]);
      }

      return returnDOM ? a : _peteCore.core.create(_composite.default, {
        elements: a
      });
    }
  };
}());

var _default = element;
exports.default = _default;