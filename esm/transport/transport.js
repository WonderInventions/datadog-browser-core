import { __spreadArrays } from "tslib";
import { addEventListener, DOM_EVENT, jsonStringify, noop, objectValues } from '../tools/utils';
// https://en.wikipedia.org/wiki/UTF-8
var HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;
/**
 * Use POST request without content type to:
 * - avoid CORS preflight requests
 * - allow usage of sendBeacon
 *
 * multiple elements are sent separated by \n in order
 * to be parsed correctly without content type header
 */
var HttpRequest = /** @class */ (function () {
    function HttpRequest(endpointUrl, bytesLimit, withBatchTime) {
        if (withBatchTime === void 0) { withBatchTime = false; }
        this.endpointUrl = endpointUrl;
        this.bytesLimit = bytesLimit;
        this.withBatchTime = withBatchTime;
    }
    HttpRequest.prototype.send = function (data, size) {
        var url = this.withBatchTime ? addBatchTime(this.endpointUrl) : this.endpointUrl;
        if (navigator.sendBeacon && size < this.bytesLimit) {
            var isQueued = navigator.sendBeacon(url, data);
            if (isQueued) {
                return;
            }
        }
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.send(data);
    };
    return HttpRequest;
}());
export { HttpRequest };
function addBatchTime(url) {
    return "" + url + (url.indexOf('?') === -1 ? '?' : '&') + "batch_time=" + new Date().getTime();
}
var Batch = /** @class */ (function () {
    function Batch(request, maxSize, bytesLimit, maxMessageSize, flushTimeout, beforeUnloadCallback) {
        if (beforeUnloadCallback === void 0) { beforeUnloadCallback = noop; }
        this.request = request;
        this.maxSize = maxSize;
        this.bytesLimit = bytesLimit;
        this.maxMessageSize = maxMessageSize;
        this.flushTimeout = flushTimeout;
        this.beforeUnloadCallback = beforeUnloadCallback;
        this.pushOnlyBuffer = [];
        this.upsertBuffer = {};
        this.bufferBytesSize = 0;
        this.bufferMessageCount = 0;
        this.flushOnVisibilityHidden();
        this.flushPeriodically();
    }
    Batch.prototype.add = function (message) {
        this.addOrUpdate(message);
    };
    Batch.prototype.upsert = function (message, key) {
        this.addOrUpdate(message, key);
    };
    Batch.prototype.flush = function () {
        if (this.bufferMessageCount !== 0) {
            var messages = __spreadArrays(this.pushOnlyBuffer, objectValues(this.upsertBuffer));
            this.request.send(messages.join('\n'), this.bufferBytesSize);
            this.pushOnlyBuffer = [];
            this.upsertBuffer = {};
            this.bufferBytesSize = 0;
            this.bufferMessageCount = 0;
        }
    };
    Batch.prototype.sizeInBytes = function (candidate) {
        // Accurate byte size computations can degrade performances when there is a lot of events to process
        if (!HAS_MULTI_BYTES_CHARACTERS.test(candidate)) {
            return candidate.length;
        }
        if (window.TextEncoder !== undefined) {
            return new TextEncoder().encode(candidate).length;
        }
        return new Blob([candidate]).size;
    };
    Batch.prototype.addOrUpdate = function (message, key) {
        var _a = this.process(message), processedMessage = _a.processedMessage, messageBytesSize = _a.messageBytesSize;
        if (messageBytesSize >= this.maxMessageSize) {
            console.warn("Discarded a message whose size was bigger than the maximum allowed size " + this.maxMessageSize + "KB.");
            return;
        }
        if (this.hasMessageFor(key)) {
            this.remove(key);
        }
        if (this.willReachedBytesLimitWith(messageBytesSize)) {
            this.flush();
        }
        this.push(processedMessage, messageBytesSize, key);
        if (this.isFull()) {
            this.flush();
        }
    };
    Batch.prototype.process = function (message) {
        var processedMessage = jsonStringify(message);
        var messageBytesSize = this.sizeInBytes(processedMessage);
        return { processedMessage: processedMessage, messageBytesSize: messageBytesSize };
    };
    Batch.prototype.push = function (processedMessage, messageBytesSize, key) {
        if (this.bufferMessageCount > 0) {
            // \n separator at serialization
            this.bufferBytesSize += 1;
        }
        if (key !== undefined) {
            this.upsertBuffer[key] = processedMessage;
        }
        else {
            this.pushOnlyBuffer.push(processedMessage);
        }
        this.bufferBytesSize += messageBytesSize;
        this.bufferMessageCount += 1;
    };
    Batch.prototype.remove = function (key) {
        var removedMessage = this.upsertBuffer[key];
        delete this.upsertBuffer[key];
        var messageBytesSize = this.sizeInBytes(removedMessage);
        this.bufferBytesSize -= messageBytesSize;
        this.bufferMessageCount -= 1;
        if (this.bufferMessageCount > 0) {
            this.bufferBytesSize -= 1;
        }
    };
    Batch.prototype.hasMessageFor = function (key) {
        return key !== undefined && this.upsertBuffer[key] !== undefined;
    };
    Batch.prototype.willReachedBytesLimitWith = function (messageBytesSize) {
        // byte of the separator at the end of the message
        return this.bufferBytesSize + messageBytesSize + 1 >= this.bytesLimit;
    };
    Batch.prototype.isFull = function () {
        return this.bufferMessageCount === this.maxSize || this.bufferBytesSize >= this.bytesLimit;
    };
    Batch.prototype.flushPeriodically = function () {
        var _this = this;
        setTimeout(function () {
            _this.flush();
            _this.flushPeriodically();
        }, this.flushTimeout);
    };
    Batch.prototype.flushOnVisibilityHidden = function () {
        var _this = this;
        /**
         * With sendBeacon, requests are guaranteed to be successfully sent during document unload
         */
        // @ts-ignore this function is not always defined
        if (navigator.sendBeacon) {
            /**
             * beforeunload is called before visibilitychange
             * register first to be sure to be called before flush on beforeunload
             * caveat: unload can still be canceled by another listener
             */
            addEventListener(window, DOM_EVENT.BEFORE_UNLOAD, this.beforeUnloadCallback);
            /**
             * Only event that guarantee to fire on mobile devices when the page transitions to background state
             * (e.g. when user switches to a different application, goes to homescreen, etc), or is being unloaded.
             */
            addEventListener(document, DOM_EVENT.VISIBILITY_CHANGE, function () {
                if (document.visibilityState === 'hidden') {
                    _this.flush();
                }
            });
            /**
             * Safari does not support yet to send a request during:
             * - a visibility change during doc unload (cf: https://bugs.webkit.org/show_bug.cgi?id=194897)
             * - a page hide transition (cf: https://bugs.webkit.org/show_bug.cgi?id=188329)
             */
            addEventListener(window, DOM_EVENT.BEFORE_UNLOAD, function () { return _this.flush(); });
        }
    };
    return Batch;
}());
export { Batch };
//# sourceMappingURL=transport.js.map