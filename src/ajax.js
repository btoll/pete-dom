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

// TODO: CORS support.

import { core } from 'pete-core';
import util from './util';

const emptyFn = core.emptyFn;
const requests = {};

/**
 * @function getDefaults
 * @type Object
 *
 * Contains the default configuration options which can be changed
 * within the object literal passed as the parameter to `ajax.load`.
 */
const getDefaults = () => {
    return {
        async: true,
        data: '',
        // The headers that will be returned (for HEAD requests only).
        headers: '',
        id: -1,
        postvars: '',
        timeout: 30000,
        type: 'GET',
        url: '',
        abort: emptyFn,
        complete: emptyFn,
        error: emptyFn,
        success: emptyFn
    };
};

const getHttpData = (response, options) => {
    // Extract the correct data from the HTTP response.
    //
    // If a HEAD request was made, determine which header name/value pair to return
    // (or all of them) and exit function.
    if (options.type.toUpperCase() === 'HEAD') {
        return !options.headers ? response.getAllResponseHeaders() : response.getResponseHeader(options.headers);
    }

    // If the specified type is 'script', execute the returned text response as if it were javascript.
    if (options.data.toLowerCase() === 'json') {
        return JSON.parse(response.responseText);
    }

    return isXml(response, options) ?
        response.responseXML :
        response.responseText;
};

const getOptions = options =>
    core.mixin(getDefaults(), options);

const getXhr = () => new XMLHttpRequest();

const isXml = (response, options) =>
    options.data.toLowerCase() === 'xml' || response.getResponseHeader('Content-Type').indexOf('xml') > -1;

const sendRequest = function (xhr, options) {
    const requestId = util.increment();
    const type = options.type.toUpperCase();

    requests[requestId] = xhr;
    options.id = requestId;

    // Initialize a callback which will fire x seconds from now, canceling the request
    // if it has not already occurred.
    setTimeout(() => {
        if (xhr) {
            xhr.abort();
            options.abort();
        }
    }, options.timeout);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            let result = getHttpData(xhr, options);
            ajax.onComplete(result, options, wasSuccessful(xhr), xhr);

            // Clean up after ourselves to avoid memory leaks.
            xhr = null;
        }
    };

    if (type === 'HEAD') {
        xhr.open(type, options.url);
    } else {
        xhr.open(type, options.url, options.async);
    }

    // Establish the connection to the server.
    if (type === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(options.postvars);
    } else {
        xhr.send(null);
    }
};

const onComplete = (response, request, success, xhr) => {
    const methodName = success ? 'success' : 'error';

    request[methodName](response, request, success, xhr);
    request.complete();

    delete requests[request.id];
};

const wasSuccessful = xhr =>
    // If no server status is provided and we're actually requesting a local file then it was successful.
    !xhr.status && location.protocol === 'file:' ||

        // Any status in the 200 range is good.
        (xhr.status >= 200 && xhr.status < 300) ||

        // Successful if the document has not been modified.
        xhr.status === 304;// ||

//            // Safari returns an empty status if the file has not been modified.
//            Pete.isSafari && typeof r.status === 'undefined';

const ajax = {
    getRequests: () => requests,

    /**
     * @function load
     * @param {Object} options
     * @return {String/XML/JSON} Optional. Will only return if configured as synchronous.
     *
     * Used for general-purpose Ajax request. Define callbacks and other customizable features within `options`.
     *
     *      ajax.load({
     *          url: 'http://www.benjamintoll.com/',
     *          type: 'get',
     *          success: resp => {
     *              // ...
     *          }
     *      });
     *
     */
    load: options => {
        const opts = getOptions(options);
        const xhr = getXhr();

        // TODO: Make all private methods public?
        sendRequest(xhr, opts);

        if (!opts.async) {
            if (wasSuccessful(xhr)) {
                return getHttpData(xhr, options);
            }
        }
    },

    // This has to be exposed in case a prototype defines its own API.
    onComplete: onComplete
};

export default ajax;

