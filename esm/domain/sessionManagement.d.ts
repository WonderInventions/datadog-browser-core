import { CookieCache, CookieOptions } from '../browser/cookie';
import { Observable } from '../tools/observable';
export declare const SESSION_COOKIE_NAME = "_dd_s";
export declare const SESSION_EXPIRATION_DELAY: number;
export declare const SESSION_TIME_OUT_DELAY: number;
export declare const VISIBILITY_CHECK_DELAY: number;
export interface Session<T> {
    renewObservable: Observable<void>;
    getId(): string | undefined;
    getTrackingType(): T | undefined;
}
export interface SessionState {
    id?: string;
    created?: string;
    expire?: string;
    [key: string]: string | undefined;
}
/**
 * Limit access to cookie to avoid performance issues
 */
export declare function startSessionManagement<TrackingType extends string>(options: CookieOptions, productKey: string, computeSessionState: (rawTrackingType?: string) => {
    trackingType: TrackingType;
    isTracked: boolean;
}): Session<TrackingType>;
export declare function isValidSessionString(sessionString: string | undefined): sessionString is string;
export declare function persistSession(session: SessionState, cookie: CookieCache): void;
export declare function stopSessionManagement(): void;
export declare function trackActivity(expandOrRenewSession: () => void): void;
