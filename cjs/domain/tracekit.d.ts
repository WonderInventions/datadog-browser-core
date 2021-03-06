export interface BrowserError extends Error {
    sourceURL?: string;
    fileName?: string;
    line?: string | number;
    lineNumber?: string | number;
    description?: string;
}
export declare type Handler = (...params: any[]) => any;
/**
 * An object representing a single stack frame.
 * @typedef {Object} StackFrame
 * @property {string=} url The JavaScript or HTML file URL.
 * @property {string=} func The function name, or empty for anonymous functions (if guessing did not work).
 * @property {string[]=} args The arguments passed to the function, if known.
 * @property {number=} line The line number, if known.
 * @property {number=} column The column number, if known.
 * @property {string[]=} context An array of source code lines; the middle element corresponds to the correct line#.
 * @memberof TraceKit
 */
export interface StackFrame {
    url?: string;
    func?: string;
    args?: string[];
    line?: number;
    column?: number;
    context?: string[];
}
/**
 * An object representing a JavaScript stack trace.
 * @typedef {Object} StackTrace
 * @property {string=} name The name of the thrown exception.
 * @property {string} message The exception error message.
 * @property {StackFrame[]} stack An array of stack frames.
 * -- method used to collect the stack trace.
 * @memberof TraceKit
 */
export interface StackTrace {
    name?: string;
    message?: string;
    url?: string;
    stack: StackFrame[];
    incomplete?: boolean;
    partial?: boolean;
}
/**
 * Wrap any function in a TraceKit reporter<br/>
 * Example: `func = wrap(func);`
 *
 * @param {Function} func Function to be wrapped
 * @return {Function} The wrapped func
 * @memberof TraceKit
 */
export declare function wrap(func: Function): (this: any) => any;
/**
 * Cross-browser processing of unhandled exceptions
 *
 * Syntax:
 * ```js
 *   report.subscribe(function(stackInfo) { ... })
 *   report.unsubscribe(function(stackInfo) { ... })
 *   report(exception)
 *   try { ...code... } catch(ex) { report(ex); }
 * ```
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *     on top frame; column number is not guaranteed
 *   - Opera: full stack trace with line and column numbers
 *   - Chrome: full stack trace with line and column numbers
 *   - Safari: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *   - IE: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where report was called.
 *
 * Handlers receive a StackTrace object as described in the
 * computeStackTrace docs.
 *
 * @memberof TraceKit
 * @namespace
 */
export declare const report: {
    (ex: Error): void;
    subscribe: (handler: Handler) => void;
    unsubscribe: (handler: Handler) => void;
    traceKitWindowOnError: (this: any, message: string | Event, url?: string | undefined, lineNo?: number | undefined, columnNo?: number | undefined, errorObj?: Error | undefined) => any;
};
/**
 * computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   ```js
 *   s = computeStackTrace.ofCaller([depth])
 *   s = computeStackTrace(exception) // consider using report instead (see below)
 *   ```
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with report,
 * which builds on top of computeStackTrace and provides better
 * IE support by utilizing the window.onerror event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 *  ```js
 *     function trace(message) {
 *         let stackInfo = computeStackTrace.ofCaller();
 *         let data = message + "\n";
 *         for(let i in stackInfo.stack) {
 *             let item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 * ```
 * @memberof TraceKit
 * @namespace
 */
export declare const computeStackTrace: {
    (ex: unknown, depth?: string | number | undefined): StackTrace;
    augmentStackTraceWithInitialElement: (stackInfo: StackTrace, url?: string | undefined, lineNo?: string | number | undefined, message?: string | undefined) => boolean;
    computeStackTraceFromStackProp: (ex: unknown) => {
        stack: {
            args: string[];
            column: number | undefined;
            func: string;
            line: number | undefined;
            url: string | undefined;
        }[];
        message: string | undefined;
        name: string | undefined;
    } | undefined;
    ofCaller: (depth?: number | undefined) => StackTrace;
};
/**
 * Extends support for global error handling for asynchronous browser
 * functions. Adopted from Closure Library's errorhandler.js
 * @memberof TraceKit
 */
export declare function extendToAsynchronousCallbacks(): void;
