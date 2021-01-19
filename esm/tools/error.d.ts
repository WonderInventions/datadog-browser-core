import { StackTrace } from '../domain/tracekit';
export interface RawError {
    startTime: number;
    message: string;
    type?: string;
    stack?: string;
    source: ErrorSource;
    resource?: {
        url: string;
        statusCode: number;
        method: string;
    };
}
export declare const ErrorSource: {
    readonly AGENT: "agent";
    readonly CONSOLE: "console";
    readonly CUSTOM: "custom";
    readonly LOGGER: "logger";
    readonly NETWORK: "network";
    readonly SOURCE: "source";
};
export declare type ErrorSource = typeof ErrorSource[keyof typeof ErrorSource];
export declare function formatUnknownError(stackTrace: StackTrace | undefined, errorObject: any, nonErrorPrefix: string): {
    message: string;
    stack: string;
    type: string | undefined;
};
export declare function toStackTraceString(stack: StackTrace): string;
