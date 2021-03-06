import { BuildEnv, Datacenter } from '../boot/init';
import { CookieOptions } from '../browser/cookie';
export declare const DEFAULT_CONFIGURATION: {
    allowedTracingOrigins: (string | RegExp)[];
    maxErrorsByMinute: number;
    maxInternalMonitoringMessagesPerPage: number;
    resourceSampleRate: number;
    sampleRate: number;
    silentMultipleInit: boolean;
    trackInteractions: boolean;
    /**
     * arbitrary value, byte precision not needed
     */
    requestErrorResponseLengthLimit: number;
    /**
     * flush automatically, aim to be lower than ALB connection timeout
     * to maximize connection reuse.
     */
    flushTimeout: number;
    /**
     * Logs intake limit
     */
    maxBatchSize: number;
    maxMessageSize: number;
    /**
     * beacon payload max queue size implementation is 64kb
     * ensure that we leave room for logs, rum and potential other users
     */
    batchBytesLimit: number;
};
export interface UserConfiguration {
    publicApiKey?: string;
    clientToken: string;
    applicationId?: string;
    internalMonitoringApiKey?: string;
    allowedTracingOrigins?: Array<string | RegExp>;
    sampleRate?: number;
    resourceSampleRate?: number;
    datacenter?: Datacenter;
    site?: string;
    enableExperimentalFeatures?: string[];
    silentMultipleInit?: boolean;
    trackInteractions?: boolean;
    proxyHost?: string;
    beforeSend?: (event: any) => void;
    service?: string;
    env?: string;
    version?: string;
    useAlternateIntakeDomains?: boolean;
    useCrossSiteSessionCookie?: boolean;
    useSecureSessionCookie?: boolean;
    trackSessionAcrossSubdomains?: boolean;
    allowLocalFile?: boolean;
    replica?: ReplicaUserConfiguration;
}
interface ReplicaUserConfiguration {
    applicationId?: string;
    clientToken: string;
}
export declare type Configuration = typeof DEFAULT_CONFIGURATION & {
    cookieOptions: CookieOptions;
    logsEndpoint: string;
    rumEndpoint: string;
    traceEndpoint: string;
    internalMonitoringEndpoint?: string;
    proxyHost?: string;
    service?: string;
    beforeSend?: (event: any) => void;
    isEnabled: (feature: string) => boolean;
    isIntakeUrl: (url: string) => boolean;
    replica?: ReplicaConfiguration;
};
interface ReplicaConfiguration {
    applicationId?: string;
    logsEndpoint: string;
    rumEndpoint: string;
    internalMonitoringEndpoint: string;
}
export declare function buildConfiguration(userConfiguration: UserConfiguration, buildEnv: BuildEnv): Configuration;
export declare function buildCookieOptions(userConfiguration: UserConfiguration): CookieOptions;
export {};
