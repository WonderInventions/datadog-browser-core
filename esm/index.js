export { DEFAULT_CONFIGURATION, buildCookieOptions } from './domain/configuration';
export { startAutomaticErrorCollection } from './domain/automaticErrorCollection';
export { computeStackTrace } from './domain/tracekit';
export { BuildMode, Datacenter, defineGlobal, makePublicApi, commonInit, checkCookiesAuthorized, checkIsNotLocalFile, } from './boot/init';
export { monitored, monitor, addMonitoringMessage, } from './domain/internalMonitoring';
export { Observable } from './tools/observable';
export { startSessionManagement, SESSION_TIME_OUT_DELAY, 
// Exposed for tests
SESSION_COOKIE_NAME, stopSessionManagement, } from './domain/sessionManagement';
export { HttpRequest, Batch } from './transport/transport';
export * from './tools/urlPolyfill';
export * from './tools/utils';
export { ErrorSource, formatUnknownError } from './tools/error';
export { combine, deepClone, withSnakeCaseKeys } from './tools/context';
export { areCookiesAuthorized, getCookie, setCookie, COOKIE_ACCESS_DELAY } from './browser/cookie';
export { startXhrProxy, resetXhrProxy } from './browser/xhrProxy';
export { startFetchProxy, resetFetchProxy, } from './browser/fetchProxy';
export { BoundedBuffer } from './tools/boundedBuffer';
export { createContextManager } from './tools/contextManager';
export { limitModification } from './tools/limitModification';
export * from './tools/specHelper';
//# sourceMappingURL=index.js.map