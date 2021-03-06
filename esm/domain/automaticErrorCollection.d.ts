import { RawError } from '../tools/error';
import { Observable } from '../tools/observable';
import { Configuration } from './configuration';
export declare type ErrorObservable = Observable<RawError>;
export declare function startAutomaticErrorCollection(configuration: Configuration): ErrorObservable;
export declare function filterErrors(configuration: Configuration, errorObservable: Observable<RawError>): Observable<RawError>;
export declare function startConsoleTracking(errorObservable: ErrorObservable): void;
export declare function stopConsoleTracking(): void;
export declare function startRuntimeErrorTracking(errorObservable: ErrorObservable): void;
export declare function stopRuntimeErrorTracking(): void;
export declare function trackNetworkError(configuration: Configuration, errorObservable: ErrorObservable): {
    stop(): void;
};
