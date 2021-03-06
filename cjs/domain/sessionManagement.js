"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cookie_1 = require("../browser/cookie");
var observable_1 = require("../tools/observable");
var utils = tslib_1.__importStar(require("../tools/utils"));
var internalMonitoring_1 = require("./internalMonitoring");
var oldCookiesMigration_1 = require("./oldCookiesMigration");
exports.SESSION_COOKIE_NAME = '_dd_s';
exports.SESSION_EXPIRATION_DELAY = 15 * utils.ONE_MINUTE;
exports.SESSION_TIME_OUT_DELAY = 4 * utils.ONE_HOUR;
exports.VISIBILITY_CHECK_DELAY = utils.ONE_MINUTE;
/**
 * Limit access to cookie to avoid performance issues
 */
function startSessionManagement(options, productKey, computeSessionState) {
    var sessionCookie = cookie_1.cacheCookieAccess(exports.SESSION_COOKIE_NAME, options);
    oldCookiesMigration_1.tryOldCookiesMigration(sessionCookie);
    var renewObservable = new observable_1.Observable();
    var currentSessionId = retrieveActiveSession(sessionCookie).id;
    var expandOrRenewSession = utils.throttle(function () {
        var session = retrieveActiveSession(sessionCookie);
        var _a = computeSessionState(session[productKey]), trackingType = _a.trackingType, isTracked = _a.isTracked;
        session[productKey] = trackingType;
        if (isTracked && !session.id) {
            session.id = utils.generateUUID();
            session.created = String(Date.now());
        }
        // save changes and expand session duration
        persistSession(session, sessionCookie);
        // If the session id has changed, notify that the session has been renewed
        if (isTracked && currentSessionId !== session.id) {
            currentSessionId = session.id;
            renewObservable.notify();
        }
    }, cookie_1.COOKIE_ACCESS_DELAY).throttled;
    var expandSession = function () {
        var session = retrieveActiveSession(sessionCookie);
        persistSession(session, sessionCookie);
    };
    expandOrRenewSession();
    trackActivity(expandOrRenewSession);
    trackVisibility(expandSession);
    return {
        getId: function () {
            return retrieveActiveSession(sessionCookie).id;
        },
        getTrackingType: function () {
            return retrieveActiveSession(sessionCookie)[productKey];
        },
        renewObservable: renewObservable,
    };
}
exports.startSessionManagement = startSessionManagement;
var SESSION_ENTRY_REGEXP = /^([a-z]+)=([a-z0-9-]+)$/;
var SESSION_ENTRY_SEPARATOR = '&';
function isValidSessionString(sessionString) {
    return (sessionString !== undefined &&
        (sessionString.indexOf(SESSION_ENTRY_SEPARATOR) !== -1 || SESSION_ENTRY_REGEXP.test(sessionString)));
}
exports.isValidSessionString = isValidSessionString;
function retrieveActiveSession(sessionCookie) {
    var session = retrieveSession(sessionCookie);
    if (isActiveSession(session)) {
        return session;
    }
    clearSession(sessionCookie);
    return {};
}
function isActiveSession(session) {
    // created and expire can be undefined for versions which was not storing them
    // these checks could be removed when older versions will not be available/live anymore
    return ((session.created === undefined || Date.now() - Number(session.created) < exports.SESSION_TIME_OUT_DELAY) &&
        (session.expire === undefined || Date.now() < Number(session.expire)));
}
function retrieveSession(sessionCookie) {
    var sessionString = sessionCookie.get();
    var session = {};
    if (isValidSessionString(sessionString)) {
        sessionString.split(SESSION_ENTRY_SEPARATOR).forEach(function (entry) {
            var matches = SESSION_ENTRY_REGEXP.exec(entry);
            if (matches !== null) {
                var key = matches[1], value = matches[2];
                session[key] = value;
            }
        });
    }
    return session;
}
function persistSession(session, cookie) {
    if (utils.isEmptyObject(session)) {
        clearSession(cookie);
        return;
    }
    session.expire = String(Date.now() + exports.SESSION_EXPIRATION_DELAY);
    var cookieString = utils
        .objectEntries(session)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + value;
    })
        .join(SESSION_ENTRY_SEPARATOR);
    cookie.set(cookieString, exports.SESSION_EXPIRATION_DELAY);
}
exports.persistSession = persistSession;
function clearSession(cookie) {
    cookie.set('', 0);
}
function stopSessionManagement() {
    stopCallbacks.forEach(function (e) { return e(); });
    stopCallbacks = [];
}
exports.stopSessionManagement = stopSessionManagement;
var stopCallbacks = [];
function trackActivity(expandOrRenewSession) {
    var stop = utils.addEventListeners(window, [utils.DOM_EVENT.CLICK, utils.DOM_EVENT.TOUCH_START, utils.DOM_EVENT.KEY_DOWN, utils.DOM_EVENT.SCROLL], expandOrRenewSession, { capture: true, passive: true }).stop;
    stopCallbacks.push(stop);
}
exports.trackActivity = trackActivity;
function trackVisibility(expandSession) {
    var expandSessionWhenVisible = internalMonitoring_1.monitor(function () {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    });
    var stop = utils.addEventListener(document, utils.DOM_EVENT.VISIBILITY_CHANGE, expandSessionWhenVisible).stop;
    stopCallbacks.push(stop);
    var visibilityCheckInterval = window.setInterval(expandSessionWhenVisible, exports.VISIBILITY_CHECK_DELAY);
    stopCallbacks.push(function () {
        clearInterval(visibilityCheckInterval);
    });
}
//# sourceMappingURL=sessionManagement.js.map