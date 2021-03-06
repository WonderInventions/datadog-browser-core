"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cookie_1 = require("../browser/cookie");
var sessionManagement_1 = require("./sessionManagement");
exports.OLD_SESSION_COOKIE_NAME = '_dd';
exports.OLD_RUM_COOKIE_NAME = '_dd_r';
exports.OLD_LOGS_COOKIE_NAME = '_dd_l';
// duplicate values to avoid dependency issues
exports.RUM_SESSION_KEY = 'rum';
exports.LOGS_SESSION_KEY = 'logs';
/**
 * This migration should remain in the codebase as long as older versions are available/live
 * to allow older sdk versions to be upgraded to newer versions without compatibility issues.
 */
function tryOldCookiesMigration(sessionCookie) {
    var sessionString = sessionCookie.get();
    var oldSessionId = cookie_1.getCookie(exports.OLD_SESSION_COOKIE_NAME);
    var oldRumType = cookie_1.getCookie(exports.OLD_RUM_COOKIE_NAME);
    var oldLogsType = cookie_1.getCookie(exports.OLD_LOGS_COOKIE_NAME);
    if (!sessionString) {
        var session = {};
        if (oldSessionId) {
            session.id = oldSessionId;
        }
        if (oldLogsType && /^[01]$/.test(oldLogsType)) {
            session[exports.LOGS_SESSION_KEY] = oldLogsType;
        }
        if (oldRumType && /^[012]$/.test(oldRumType)) {
            session[exports.RUM_SESSION_KEY] = oldRumType;
        }
        sessionManagement_1.persistSession(session, sessionCookie);
    }
}
exports.tryOldCookiesMigration = tryOldCookiesMigration;
//# sourceMappingURL=oldCookiesMigration.js.map