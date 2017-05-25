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
 * pete-core is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with pete-dom.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import pete from './pete';

const reAddCommas = /(\d+)(\d{3})/;
const reCamelCase = /([a-zA-Z0-9])([a-zA-Z0-9]*)[_|\-|\.|\s]([a-zA-Z0-9])/g;
// Replace all . or _ or - with a space and then capitalize the first letter of each word.
const reCapFirstLetter = /[\s|_|\-|\.](\w)/g;
const reRange = /(\-?\w+)(\.{2,3})(\-?\w+)/;

// For internal use only, can be modified via Pete#flush.
let cache = {};
let disabled = {};
let events = {};
let garbage = {};

const util = {
    /**
     * @function Pete.core.util.addCommas
     * @param {Number/String} format The number to be formatted with commas.
     * @return {String}
     *
     * Accepts a `Number` or a `String` and formats it with commas, i.e. `3,456,678`.
     *
     * Note that it's returned as a `String` because it may contain a comma and `parseInt()`
     * gives up when it sees a character that doesn't evaluate to a number.
     */
    addCommas: format => {
        let str = format + '';

        while (reAddCommas.test(str)) {
            str = str.replace(reAddCommas, '$1,$2');
        }

        // Can't return as a number b/c it could contain commas and parseInt() gives up when it sees a comma.
        return str;
    },

    /**
     * @function Pete.core.util.camelCase
     * @param {String} str
     * @return {String}
     *
     * Searches the `String` for an instance of a period (.), underscore (_), whitespace ( ) or hyphen (-)
     * in a word and removes it, capitalizing the first letter of the joined text.
     *
     *      document.write('This old Farm.land Boy-oh_boy'.camelCase());
     *      // This old farmLand boyOhBoy
     *
     */
    camelCase: str =>
        str.replace(reCamelCase, (a, b, c, d) => b.toLocaleLowerCase() + c + d.toLocaleUpperCase()),

    /**
     * @function Pete.core.util.capFirstLetter
     * @param {String} str
     * @return {String}
     *
     * Replaces every period (.), underscore (_) and hyphen (-) with a space ( ) and then capitalizes the first letter of each word.
     */
    capFirstLetter: str => {
        str = str.replace(reCapFirstLetter, (a, b) => ` ${b.toLocaleUpperCase()}`);
        return str.charAt(0).toLocaleUpperCase() + str.slice(1);
    },

    /**
     * @function Pete.core.util.flush
     * @param {Array/String} action Function argument(s) can be an `Array` or one or more `Strings`
     * @return {None}
     *
     *
     *       `cache` - clear the cache of any `Pete.Elements`
     *       `disabled` - re-enable any disabled elements
     *       `flyweight` - clear the flyweight object
     *       `garbage` - clear the garbage cache of any `HTMLElements` that were removed from the DOM
     *
     */
    flush: (...actions) => {
        if (!actions.length) {
            return;
        }

        for (let i = 0, len = actions.length; i < len; i++) {
            switch (actions[i]) {
                case 'cache':
                    cache = {};
                    break;

                case 'disabled':
                    if (!util.isEmpty(disabled)) {
                        disabled = {};
                    }
                    break;

                /*
                case 'flyweight':
                    flyweight = {};
                    break;
                */

                case 'garbage':
                    garbage = {};
            }
        }
    },

    /**
     * @function getX
     * @param {EventObject} e
     * @return {Number}
     *
     * Returns the X coordinate of the queried element in the viewport.
     */
    getX: function (e) {
        // Check for the non-IE position, then the IE position.
        return e.pageX || e.clientX + document.body.scrollLeft;
    },

    /**
     * @function getY
     * @param {EventObject} e
     * @return {Number}
     *
     * Returns the Y coordinate of the queried element in the viewport.
     */
    getY: function (e) {
        // Check for the non-IE position, then the IE position.
        return e.pageY || e.clientY + document.body.scrollTop;
    },

    /**
     * @function Pete.core.util.howMany
     * @param {String} haystack The string to search
     * @param {String} needle The part to search for
     * @return {Number}
     *
     * Returns how many times `needle` occurs in the given `haystack`.
     */
    howMany: (haystack, needle) => {
        let i = 0;
        let pos = haystack.indexOf(needle);

        while (pos > -1) {
            pos = haystack.indexOf(needle, pos + 1);
            i++;
        }

        return i;
    },

    /**
     * @function Pete.core.util.increment
     * @param {None}
     * @return {Number}
     */
    increment: (() => {
        let n = 0;
        return () => n++;
    })(),

    /**
     * @function Pete.core.util.isEmpty
     * @param {Mixed} v
     * @return {Boolean}
     *
     * Tests if the variable is empty. `null`, `undefined` and `NaN` are considered to be empty values.
     */
    isEmpty: v => {
        let empty = true;

        if (
            typeof v === 'string' && v.length > 0 ||
            typeof v === 'number' && !isNaN(v) ||
            // We need a type assertion here b/c TypeScript cannot determine the type passed to `this.isArray`.
            Array.isArray(v) && v.length > 0 ||
            (v instanceof Object) && Object.keys(v).length ||
            v instanceof Date
        ) {
            empty = false;
        }

        return empty;
    },

    /**
     * @function Pete.core.util.makeId
     * @param {None}
     * @return {String}
     *
     * Creates an `element` a unique ID if it doesn't already have one.
     */
    makeId: () => pete.globalSymbol + util.increment(),

    /**
     * @function Pete.core.util.range
     * @param {String} range
     * @return {Array}
     *
     * Inspired by Ruby's `range` method. Since this method is based on Ruby's implementation, the syntax and
     * functionality is very similar. This method will return both numeric and alphabetical arrays. The beginning
     * range element must always be smaller than the ending range element. Note that even though numeric ranges
     * are passed to the method as a string data type, i.e., "1..100", the array returned will contain numeric
     * elements. Alphabetical ranges will of course return an array of strings.
     *
     * Just as in Ruby, the ".." range is inclusive, while the "..." range is exclusive.
     *
     *      util.range('-52..-5');  // Returns an array containing elements -52 through -5, including -5.
     *      util.range('-52...-5'); // Returns an array containing elements -52 through -5, excluding -5.
     *      util.range('-5..-52');  // Throws an exception.
     *      util.range('a..z');     // Returns an array containing elements 'a' through 'z', including 'z'.
     *      util.range('A...Z');    // Returns an array containing elements 'A' through 'Z', excluding 'Z'.
     *      util.range('E..A');     // Throws an exception.
     *
     * Example:
     *
     *      const temp = 72;
     *
     *      switch (true) {
     *          case Pete.range('-30..-1').contains(temp):
     *          console.log('Sub-freezing');
     *          break;
     *
     *          case Pete.range('0..32').contains(temp):
     *              console.log('Freezing');
     *              break;
     *
     *          case Pete.range('33..65').contains(temp):
     *              console.log('Cool');
     *              break;
     *
     *          case Pete.range('66..95').contains(temp):
     *              console.log('Balmy');
     *              break;
     *
     *          case Pete.range('96..120').contains(temp):
     *              console.log('Hot, hot, hot!');
     *              break;
     *
     *          default:
     *              console.log('You must be very uncomfortable, wherever you are!');
     *      }
     *
     *      // Logs 'Balmy'.
     *
     *
     * Another example:
     *
     *      // Create and return the alphabet as a string.
     *      util.range("A..Z").join("");
     *
     */
    range: range => {
        const arr = [];
        const chunks = reRange.exec(range);
        const isNumeric = chunks[1] === '0' || !!Number(chunks[1]);

        if (reRange.test(range)) {
            let begin, end;

            // NOTE !!(Number("0") evaluates to falsy for numeric ranges so specifically
            // check for this condition.
            // Re-assign the value of range to the actual range, i.e., ".." or "...".
            range = chunks[2];

            // If it's a numeric range cast the string into a number else get the Unicode
            // value of the letter for alpha ranges.
            begin = isNumeric ? Number(chunks[1]) : chunks[1].charCodeAt();
            end = isNumeric ? Number(chunks[3]) : chunks[3].charCodeAt();

            // Establish some exceptions.
            if (begin > end) {
                throw new Error('The end range cannot be smaller than the start range.');
            }

            if (isNumeric && (end - begin) > 1000) {
                throw new Error('The range is too large, please narrow it.');
            }

            for (let i = 0; begin <= end; i++, begin++) {
                // If it's an alphabetical range then turn the Unicode value into a string
                // (number to a string).
                arr[i] = isNumeric ? begin : String.fromCharCode(begin);
            }

            if (range === '...') {
                // If the range is exclusive, lop off the last index.
                arr.splice(-1);
            }
        }

        return arr;
    }
};

export default util;

