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

import { core } from 'pete-core';
import util from './util';

const pete = {
    /**
     * @property globalSymbol
     * @type String
     *
     * Constant. The global symbol that is used in everything from the creation of unique `Element` ids to class names.
     */
    globalSymbol: 'Pete',

    id: () => `${pete.globalSymbol}${util.increment()}`,

    wrap: function (proto, method) {
        if (!proto[method]) {
            proto[method] = function () {
                return this.invoke(method, arguments);
            };
        }
    },

    /**
     * @property tags
     * @type RegExp
     *
     * This contains all possible HTML tags. Is used by `domQuery` and `get.dom`. Is used internally but can be overwritten for any custom needs.
     */
    tags: /^(?:\*|a|abbr|acronym|address|applet|area|b|base|basefont|bdo|big|blockquote|body|br|button|caption|center|cite|code|col|colgroup|dd|del|dfn|dir|div|dl|dt|em|fieldset|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|isindex|kbd|label|legend|li|link|map|menu|meta|noframes|noscript|object|ol|optgroup|option|p|param|pre|q|s|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|tt|u|ul|var)$/i

};

const ua = navigator.userAgent.toLocaleLowerCase();
const isStrict = document.compatMode === 'CSS1Compat';
const isOpera = ua.indexOf('opera') > -1;
const isSafari = (/webkit|khtml/).test(ua);
const isSafari3 = isSafari && ua.indexOf('webkit/5') !== -1;
const isiPhone = ua.indexOf('iphone') > -1;
//const isIE = /*@cc_on!@*/false; //IE conditional compilation;
const isIE = !isOpera && ua.indexOf('msie') > -1;
const isIE6 = !isOpera && ua.indexOf('msie 6') > -1;
const isIE7 = !isOpera && ua.indexOf('msie 7') > -1;
const isIE8 = !isOpera && ua.indexOf('msie 8') > -1;

core.mixin(pete, {
    /**
    * @property isStrict
    * @type Boolean
    */
    isStrict: isStrict,

    /**
    * @property isOpera
    * @type Boolean
    */
    isOpera: isOpera,

    /**
    * @property isSafari
    * @type Boolean
    */
    isSafari: isSafari,

    /**
    * @property isSafari3
    * @type Boolean
    */
    isSafari3: isSafari3,

    /**
    * @property isiPhone
    * @type Boolean
    */
    isiPhone: isiPhone,

    /**
    * @property isIE
    * @type Boolean
    */
    isIE: isIE,

    /**
    * @property isIE6
    * @type Boolean
    */
    isIE6: isIE6,

    /**
    * @property isIE7
    * @type Boolean
    */
    isIE7: isIE7,

    /**
    * @property isIE8
    * @type Boolean
    */
    isIE8: isIE8
});

core.mixin(pete, {
    cache: {},
    disabled: {},
    events: {},
    garbage: {}
});

export default pete;

