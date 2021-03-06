export declare const ONE_SECOND = 1000;
export declare const ONE_MINUTE: number;
export declare const ONE_HOUR: number;
export declare const ONE_KILO_BYTE = 1024;
export declare enum DOM_EVENT {
    BEFORE_UNLOAD = "beforeunload",
    CLICK = "click",
    KEY_DOWN = "keydown",
    LOAD = "load",
    POP_STATE = "popstate",
    SCROLL = "scroll",
    TOUCH_START = "touchstart",
    VISIBILITY_CHANGE = "visibilitychange",
    DOM_CONTENT_LOADED = "DOMContentLoaded",
    POINTER_DOWN = "pointerdown",
    POINTER_UP = "pointerup",
    POINTER_CANCEL = "pointercancel",
    HASH_CHANGE = "hashchange",
    PAGE_HIDE = "pagehide",
    MOUSE_DOWN = "mousedown"
}
export declare enum ResourceType {
    DOCUMENT = "document",
    XHR = "xhr",
    BEACON = "beacon",
    FETCH = "fetch",
    CSS = "css",
    JS = "js",
    IMAGE = "image",
    FONT = "font",
    MEDIA = "media",
    OTHER = "other"
}
export declare enum RequestType {
    FETCH = "fetch",
    XHR = "xhr"
}
export declare function throttle(fn: () => void, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): {
    throttled: () => void;
    cancel: () => void;
};
interface Assignable {
    [key: string]: any;
}
export declare function assign(target: Assignable, ...toAssign: Assignable[]): void;
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
export declare function generateUUID(placeholder?: string): string;
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
export declare function performDraw(threshold: number): boolean;
export declare function round(num: number, decimals: 0 | 1 | 2 | 3): number;
export declare function msToNs<T>(duration: number | T): number | T;
export declare function noop(): void;
/**
 * Custom implementation of JSON.stringify that ignores value.toJSON.
 * We need to do that because some sites badly override toJSON on certain objects.
 * Note this still supposes that JSON.stringify is correct...
 */
export declare function jsonStringify(value: unknown, replacer?: Array<string | number>, space?: string | number): string | undefined;
export declare function includes(candidate: string, search: string): boolean;
export declare function includes<T>(candidate: T[], search: T): boolean;
export declare function find<T>(array: T[], predicate: (item: T, index: number, array: T[]) => unknown): T | undefined;
export declare function isPercentage(value: unknown): boolean;
export declare function isNumber(value: unknown): value is number;
/**
 * Get the time since the navigation was started.
 *
 * Note: this does not use `performance.timeOrigin` because it doesn't seem to reflect the actual
 * time on which the navigation has started: it may be much farther in the past, at least in Firefox 71.
 * Related issue in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1429926
 */
export declare function getRelativeTime(timestamp: number): number;
export declare function getTimestamp(relativeTime: number): number;
export declare function getNavigationStart(): number;
export declare function objectValues(object: {
    [key: string]: unknown;
}): unknown[];
export declare function objectEntries(object: {
    [key: string]: unknown;
}): Array<[string, unknown]>;
export declare function isEmptyObject(object: object): boolean;
export declare function mapValues<A, B>(object: {
    [key: string]: A;
}, fn: (arg: A) => B): {
    [key: string]: B;
};
/**
 * inspired by https://mathiasbynens.be/notes/globalthis
 */
export declare function getGlobalObject<T>(): T;
export declare function getLocationOrigin(): string;
/**
 * IE fallback
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 */
export declare function getLinkElementOrigin(element: Location | HTMLAnchorElement | URL): string;
export declare function findCommaSeparatedValue(rawString: string, name: string): string | undefined;
export declare function safeTruncate(candidate: string, length: number): string;
export interface EventEmitter {
    addEventListener(event: DOM_EVENT, listener: (event: Event) => void, options?: boolean | {
        capture?: boolean;
        passive?: boolean;
    }): void;
    removeEventListener(event: DOM_EVENT, listener: (event: Event) => void, options?: boolean | {
        capture?: boolean;
        passive?: boolean;
    }): void;
}
interface AddEventListenerOptions {
    once?: boolean;
    capture?: boolean;
    passive?: boolean;
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
export declare function addEventListener(emitter: EventEmitter, event: DOM_EVENT, listener: (event: Event) => void, options?: AddEventListenerOptions): {
    stop(): void;
};
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
export declare function addEventListeners(emitter: EventEmitter, events: DOM_EVENT[], listener: (event: Event) => void, { once, capture, passive }?: {
    once?: boolean;
    capture?: boolean;
    passive?: boolean;
}): {
    stop(): void;
};
export {};
