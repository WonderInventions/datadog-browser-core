import { CookieOptions } from '../browser/cookie';
import { UserConfiguration } from '../domain/configuration';
export declare function makePublicApi<T>(stub: T): T & {
    onReady(callback: () => void): void;
};
export declare function defineGlobal<Global, Name extends keyof Global>(global: Global, name: Name, api: Global[Name]): void;
export declare const Datacenter: {
    readonly EU: "eu";
    readonly US: "us";
};
export declare type Datacenter = typeof Datacenter[keyof typeof Datacenter];
export declare const INTAKE_SITE: {
    eu: string;
    us: string;
};
export declare enum BuildMode {
    RELEASE = "release",
    STAGING = "staging",
    E2E_TEST = "e2e-test"
}
export interface BuildEnv {
    datacenter: Datacenter;
    buildMode: BuildMode;
    sdkVersion: string;
}
export declare function commonInit(userConfiguration: UserConfiguration, buildEnv: BuildEnv): {
    configuration: import("../domain/configuration").Configuration;
    internalMonitoring: import("../domain/internalMonitoring").InternalMonitoring;
};
export declare function checkCookiesAuthorized(options: CookieOptions): boolean;
export declare function checkIsNotLocalFile(): boolean;
