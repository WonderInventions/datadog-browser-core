"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cookie_1 = require("../browser/cookie");
var configuration_1 = require("../domain/configuration");
var internalMonitoring_1 = require("../domain/internalMonitoring");
function makePublicApi(stub) {
    var publicApi = tslib_1.__assign(tslib_1.__assign({}, stub), { 
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
            return internalMonitoring_1.setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
exports.makePublicApi = makePublicApi;
function defineGlobal(global, name, api) {
    var existingGlobalVariable = global[name];
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach(function (fn) { return fn(); });
    }
}
exports.defineGlobal = defineGlobal;
exports.Datacenter = {
    EU: 'eu',
    US: 'us',
};
exports.INTAKE_SITE = (_a = {},
    _a[exports.Datacenter.EU] = 'datadoghq.eu',
    _a[exports.Datacenter.US] = 'datadoghq.com',
    _a);
var BuildMode;
(function (BuildMode) {
    BuildMode["RELEASE"] = "release";
    BuildMode["STAGING"] = "staging";
    BuildMode["E2E_TEST"] = "e2e-test";
})(BuildMode = exports.BuildMode || (exports.BuildMode = {}));
function commonInit(userConfiguration, buildEnv) {
    var configuration = configuration_1.buildConfiguration(userConfiguration, buildEnv);
    var internalMonitoring = internalMonitoring_1.startInternalMonitoring(configuration);
    return {
        configuration: configuration,
        internalMonitoring: internalMonitoring,
    };
}
exports.commonInit = commonInit;
function checkCookiesAuthorized(options) {
    if (!cookie_1.areCookiesAuthorized(options)) {
        console.warn('Cookies are not authorized, we will not send any data.');
        return false;
    }
    return true;
}
exports.checkCookiesAuthorized = checkCookiesAuthorized;
function checkIsNotLocalFile() {
    if (isLocalFile()) {
        console.error('Execution is not allowed in the current context.');
        return false;
    }
    return true;
}
exports.checkIsNotLocalFile = checkIsNotLocalFile;
function isLocalFile() {
    return window.location.protocol === 'file:';
}
//# sourceMappingURL=init.js.map