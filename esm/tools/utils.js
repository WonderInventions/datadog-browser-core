import { monitor } from '../domain/internalMonitoring';
export var ONE_SECOND = 1000;
export var ONE_MINUTE = 60 * ONE_SECOND;
export var ONE_HOUR = 60 * ONE_MINUTE;
export var ONE_KILO_BYTE = 1024;
export var DOM_EVENT;
(function (DOM_EVENT) {
    DOM_EVENT["BEFORE_UNLOAD"] = "beforeunload";
    DOM_EVENT["CLICK"] = "click";
    DOM_EVENT["KEY_DOWN"] = "keydown";
    DOM_EVENT["LOAD"] = "load";
    DOM_EVENT["POP_STATE"] = "popstate";
    DOM_EVENT["SCROLL"] = "scroll";
    DOM_EVENT["TOUCH_START"] = "touchstart";
    DOM_EVENT["VISIBILITY_CHANGE"] = "visibilitychange";
    DOM_EVENT["DOM_CONTENT_LOADED"] = "DOMContentLoaded";
    DOM_EVENT["POINTER_DOWN"] = "pointerdown";
    DOM_EVENT["POINTER_UP"] = "pointerup";
    DOM_EVENT["POINTER_CANCEL"] = "pointercancel";
    DOM_EVENT["HASH_CHANGE"] = "hashchange";
    DOM_EVENT["PAGE_HIDE"] = "pagehide";
    DOM_EVENT["MOUSE_DOWN"] = "mousedown";
})(DOM_EVENT || (DOM_EVENT = {}));
export var ResourceType;
(function (ResourceType) {
    ResourceType["DOCUMENT"] = "document";
    ResourceType["XHR"] = "xhr";
    ResourceType["BEACON"] = "beacon";
    ResourceType["FETCH"] = "fetch";
    ResourceType["CSS"] = "css";
    ResourceType["JS"] = "js";
    ResourceType["IMAGE"] = "image";
    ResourceType["FONT"] = "font";
    ResourceType["MEDIA"] = "media";
    ResourceType["OTHER"] = "other";
})(ResourceType || (ResourceType = {}));
export var RequestType;
(function (RequestType) {
    RequestType["FETCH"] = "fetch";
    RequestType["XHR"] = "xhr";
})(RequestType || (RequestType = {}));
// use lodash API
export function throttle(fn, wait, options) {
    var needLeadingExecution = options && options.leading !== undefined ? options.leading : true;
    var needTrailingExecution = options && options.trailing !== undefined ? options.trailing : true;
    var inWaitPeriod = false;
    var hasPendingExecution = false;
    var pendingTimeoutId;
    return {
        throttled: function () {
            var _this = this;
            if (inWaitPeriod) {
                hasPendingExecution = true;
                return;
            }
            if (needLeadingExecution) {
                fn.apply(this);
            }
            else {
                hasPendingExecution = true;
            }
            inWaitPeriod = true;
            pendingTimeoutId = window.setTimeout(function () {
                if (needTrailingExecution && hasPendingExecution) {
                    fn.apply(_this);
                }
                inWaitPeriod = false;
                hasPendingExecution = false;
            }, wait);
        },
        cancel: function () {
            window.clearTimeout(pendingTimeoutId);
            inWaitPeriod = false;
            hasPendingExecution = false;
        },
    };
}
export function assign(target) {
    var toAssign = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        toAssign[_i - 1] = arguments[_i];
    }
    toAssign.forEach(function (source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });
}
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
export function generateUUID(placeholder) {
    return placeholder
        ? // tslint:disable-next-line no-bitwise
            (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
        : (1e7 + "-" + 1e3 + "-" + 4e3 + "-" + 8e3 + "-" + 1e11).replace(/[018]/g, generateUUID);
}
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
export function performDraw(threshold) {
    return threshold !== 0 && Math.random() * 100 <= threshold;
}
export function round(num, decimals) {
    return +num.toFixed(decimals);
}
export function msToNs(duration) {
    if (typeof duration !== 'number') {
        return duration;
    }
    return round(duration * 1e6, 0);
}
// tslint:disable-next-line:no-empty
export function noop() { }
/**
 * Custom implementation of JSON.stringify that ignores value.toJSON.
 * We need to do that because some sites badly override toJSON on certain objects.
 * Note this still supposes that JSON.stringify is correct...
 */
export function jsonStringify(value, replacer, space) {
    if (value === null || value === undefined) {
        return JSON.stringify(value);
    }
    var originalToJSON = [false, undefined];
    if (hasToJSON(value)) {
        // We need to add a flag and not rely on the truthiness of value.toJSON
        // because it can be set but undefined and that's actually significant.
        originalToJSON = [true, value.toJSON];
        delete value.toJSON;
    }
    var originalProtoToJSON = [false, undefined];
    var prototype;
    if (typeof value === 'object') {
        prototype = Object.getPrototypeOf(value);
        if (hasToJSON(prototype)) {
            originalProtoToJSON = [true, prototype.toJSON];
            delete prototype.toJSON;
        }
    }
    var result;
    try {
        result = JSON.stringify(value, undefined, space);
    }
    catch (_a) {
        result = '<error: unable to serialize object>';
    }
    finally {
        if (originalToJSON[0]) {
            ;
            value.toJSON = originalToJSON[1];
        }
        if (originalProtoToJSON[0]) {
            ;
            prototype.toJSON = originalProtoToJSON[1];
        }
    }
    return result;
}
function hasToJSON(value) {
    return typeof value === 'object' && value !== null && value.hasOwnProperty('toJSON');
}
export function includes(candidate, search) {
    // tslint:disable-next-line: no-unsafe-any
    return candidate.indexOf(search) !== -1;
}
export function find(array, predicate) {
    for (var i = 0; i < array.length; i += 1) {
        var item = array[i];
        if (predicate(item, i, array)) {
            return item;
        }
    }
    return undefined;
}
export function isPercentage(value) {
    return isNumber(value) && value >= 0 && value <= 100;
}
export function isNumber(value) {
    return typeof value === 'number';
}
/**
 * Get the time since the navigation was started.
 *
 * Note: this does not use `performance.timeOrigin` because it doesn't seem to reflect the actual
 * time on which the navigation has started: it may be much farther in the past, at least in Firefox 71.
 * Related issue in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1429926
 */
export function getRelativeTime(timestamp) {
    return timestamp - getNavigationStart();
}
export function getTimestamp(relativeTime) {
    return Math.floor(getNavigationStart() + relativeTime);
}
/**
 * Navigation start slightly change on some rare cases
 */
var navigationStart;
export function getNavigationStart() {
    if (navigationStart === undefined) {
        navigationStart = performance.timing.navigationStart;
    }
    return navigationStart;
}
export function objectValues(object) {
    var values = [];
    Object.keys(object).forEach(function (key) {
        values.push(object[key]);
    });
    return values;
}
export function objectEntries(object) {
    return Object.keys(object).map(function (key) { return [key, object[key]]; });
}
export function isEmptyObject(object) {
    return Object.keys(object).length === 0;
}
export function mapValues(object, fn) {
    var newObject = {};
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var key = _a[_i];
        newObject[key] = fn(object[key]);
    }
    return newObject;
}
/**
 * inspired by https://mathiasbynens.be/notes/globalthis
 */
export function getGlobalObject() {
    if (typeof globalThis === 'object') {
        return globalThis;
    }
    Object.defineProperty(Object.prototype, '_dd_temp_', {
        get: function () {
            return this;
        },
        configurable: true,
    });
    // @ts-ignore
    var globalObject = _dd_temp_;
    // @ts-ignore
    delete Object.prototype._dd_temp_;
    if (typeof globalObject !== 'object') {
        // on safari _dd_temp_ is available on window but not globally
        // fallback on other browser globals check
        if (typeof self === 'object') {
            globalObject = self;
        }
        else if (typeof window === 'object') {
            globalObject = window;
        }
        else {
            globalObject = {};
        }
    }
    return globalObject;
}
export function getLocationOrigin() {
    return getLinkElementOrigin(window.location);
}
/**
 * IE fallback
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 */
export function getLinkElementOrigin(element) {
    if (element.origin) {
        return element.origin;
    }
    var sanitizedHost = element.host.replace(/(:80|:443)$/, '');
    return element.protocol + "//" + sanitizedHost;
}
export function findCommaSeparatedValue(rawString, name) {
    var matches = rawString.match("(?:^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return matches ? matches[1] : undefined;
}
export function safeTruncate(candidate, length) {
    var lastChar = candidate.charCodeAt(length - 1);
    // check if it is the high part of a surrogate pair
    if (lastChar >= 0xd800 && lastChar <= 0xdbff) {
        return candidate.slice(0, length + 1);
    }
    return candidate.slice(0, length);
}
/**
 * Add an event listener to an event emitter object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by:
 *   * using an option object only if needed
 *   * emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 */
export function addEventListener(emitter, event, listener, options) {
    return addEventListeners(emitter, [event], listener, options);
}
/**
 * Add event listeners to an event emitter object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by:
 *   * using an option object only if needed
 *   * emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 *
 * * with `once: true`, the listener will be called at most once, even if different events are
 *   listened
 */
export function addEventListeners(emitter, events, listener, _a) {
    var _b = _a === void 0 ? {} : _a, once = _b.once, capture = _b.capture, passive = _b.passive;
    var wrapedListener = monitor(once
        ? function (event) {
            stop();
            listener(event);
        }
        : listener);
    var options = passive ? { capture: capture, passive: passive } : capture;
    events.forEach(function (event) { return emitter.addEventListener(event, wrapedListener, options); });
    var stop = function () { return events.forEach(function (event) { return emitter.removeEventListener(event, wrapedListener, options); }); };
    return {
        stop: stop,
    };
}
//# sourceMappingURL=utils.js.map