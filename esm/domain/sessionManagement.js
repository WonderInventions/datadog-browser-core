import { cacheCookieAccess, COOKIE_ACCESS_DELAY } from '../browser/cookie';
import { Observable } from '../tools/observable';
import * as utils from '../tools/utils';
import { monitor } from './internalMonitoring';
import { tryOldCookiesMigration } from './oldCookiesMigration';
export var SESSION_COOKIE_NAME = '_dd_s';
export var SESSION_EXPIRATION_DELAY = 15 * utils.ONE_MINUTE;
export var SESSION_TIME_OUT_DELAY = 4 * utils.ONE_HOUR;
export var VISIBILITY_CHECK_DELAY = utils.ONE_MINUTE;
/**
 * Limit access to cookie to avoid performance issues
 */
export function startSessionManagement(options, productKey, computeSessionState) {
    var sessionCookie = cacheCookieAccess(SESSION_COOKIE_NAME, options);
    tryOldCookiesMigration(sessionCookie);
    var renewObservable = new Observable();
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
    }, COOKIE_ACCESS_DELAY).throttled;
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
var SESSION_ENTRY_REGEXP = /^([a-z]+)=([a-z0-9-]+)$/;
var SESSION_ENTRY_SEPARATOR = '&';
export function isValidSessionString(sessionString) {
    return (sessionString !== undefined &&
        (sessionString.indexOf(SESSION_ENTRY_SEPARATOR) !== -1 || SESSION_ENTRY_REGEXP.test(sessionString)));
}
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
    return ((session.created === undefined || Date.now() - Number(session.created) < SESSION_TIME_OUT_DELAY) &&
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
export function persistSession(session, cookie) {
    if (utils.isEmptyObject(session)) {
        clearSession(cookie);
        return;
    }
    session.expire = String(Date.now() + SESSION_EXPIRATION_DELAY);
    var cookieString = utils
        .objectEntries(session)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + value;
    })
        .join(SESSION_ENTRY_SEPARATOR);
    cookie.set(cookieString, SESSION_EXPIRATION_DELAY);
}
function clearSession(cookie) {
    cookie.set('', 0);
}
export function stopSessionManagement() {
    stopCallbacks.forEach(function (e) { return e(); });
    stopCallbacks = [];
}
var stopCallbacks = [];
export function trackActivity(expandOrRenewSession) {
    var stop = utils.addEventListeners(window, [utils.DOM_EVENT.CLICK, utils.DOM_EVENT.TOUCH_START, utils.DOM_EVENT.KEY_DOWN, utils.DOM_EVENT.SCROLL], expandOrRenewSession, { capture: true, passive: true }).stop;
    stopCallbacks.push(stop);
}
function trackVisibility(expandSession) {
    var expandSessionWhenVisible = monitor(function () {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    });
    var stop = utils.addEventListener(document, utils.DOM_EVENT.VISIBILITY_CHANGE, expandSessionWhenVisible).stop;
    stopCallbacks.push(stop);
    var visibilityCheckInterval = window.setInterval(expandSessionWhenVisible, VISIBILITY_CHECK_DELAY);
    stopCallbacks.push(function () {
        clearInterval(visibilityCheckInterval);
    });
}
//# sourceMappingURL=sessionManagement.js.map