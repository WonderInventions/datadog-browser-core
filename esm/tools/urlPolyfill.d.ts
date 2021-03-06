export declare function normalizeUrl(url: string): string;
export declare function isValidUrl(url: string): boolean;
export declare function haveSameOrigin(url1: string, url2: string): boolean;
export declare function getOrigin(url: string): string;
export declare function getPathName(url: string): string;
export declare function getSearch(url: string): string;
export declare function getHash(url: string): string;
export declare function buildUrl(url: string, base?: string): HTMLAnchorElement | URL;
