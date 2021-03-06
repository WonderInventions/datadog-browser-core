import { Context } from '../tools/context';
/**
 * Use POST request without content type to:
 * - avoid CORS preflight requests
 * - allow usage of sendBeacon
 *
 * multiple elements are sent separated by \n in order
 * to be parsed correctly without content type header
 */
export declare class HttpRequest {
    private endpointUrl;
    private bytesLimit;
    private withBatchTime;
    constructor(endpointUrl: string, bytesLimit: number, withBatchTime?: boolean);
    send(data: string, size: number): void;
}
export declare class Batch {
    private request;
    private maxSize;
    private bytesLimit;
    private maxMessageSize;
    private flushTimeout;
    private beforeUnloadCallback;
    private pushOnlyBuffer;
    private upsertBuffer;
    private bufferBytesSize;
    private bufferMessageCount;
    constructor(request: HttpRequest, maxSize: number, bytesLimit: number, maxMessageSize: number, flushTimeout: number, beforeUnloadCallback?: () => void);
    add(message: Context): void;
    upsert(message: Context, key: string): void;
    flush(): void;
    sizeInBytes(candidate: string): number;
    private addOrUpdate;
    private process;
    private push;
    private remove;
    private hasMessageFor;
    private willReachedBytesLimitWith;
    private isFull;
    private flushPeriodically;
    private flushOnVisibilityHidden;
}
