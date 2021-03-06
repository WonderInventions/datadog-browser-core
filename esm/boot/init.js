var _a;
import { __assign } from "tslib";
import { areCookiesAuthorized } from '../browser/cookie';
import { buildConfiguration } from '../domain/configuration';
import { setDebugMode, startInternalMonitoring } from '../domain/internalMonitoring';
export function makePublicApi(stub) {
    var publicApi = __assign(__assign({}, stub), { 
        // This API method is intentionally not monitored, since the only thing executed is the
        // user-provided 'callback'.  All SDK usages executed in the callback should be monitored, and
        // we don't want to interfer with the user uncaught exceptions.
        onReady: function (callback) {
            callback();
        } });
    // Add an "hidden" property to set debug mode. We define it that way to hide it
    // as much as possible but of course it's not a real protection.
    Object.defineProperty(publicApi, '_setDebug', {
        get: function () {
            return setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
export function defineGlobal(global, name, api) {
    var existingGlobalVariable = global[name];
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach(function (fn) { return fn(); });
    }
}
export var Datacenter = {
    EU: 'eu',
    US: 'us',
};
export var INTAKE_SITE = (_a = {},
    _a[Datacenter.EU] = 'datadoghq.eu',
    _a[Datacenter.US] = 'datadoghq.com',
    _a);
export var BuildMode;
(function (BuildMode) {
    BuildMode["RELEASE"] = "release";
    BuildMode["STAGING"] = "staging";
    BuildMode["E2E_TEST"] = "e2e-test";
})(BuildMode || (BuildMode = {}));
export function commonInit(userConfiguration, buildEnv) {
    var configuration = buildConfiguration(userConfiguration, buildEnv);
    var internalMonitoring = startInternalMonitoring(configuration);
    return {
        configuration: configuration,
        internalMonitoring: internalMonitoring,
    };
}
export function checkCookiesAuthorized(options) {
    if (!areCookiesAuthorized(options)) {
        console.warn('Cookies are not authorized, we will not send any data.');
        return false;
    }
    return true;
}
export function checkIsNotLocalFile() {
    if (isLocalFile()) {
        console.error('Execution is not allowed in the current context.');
        return false;
    }
    return true;
}
function isLocalFile() {
    return window.location.protocol === 'file:';
}
//# sourceMappingURL=init.js.map