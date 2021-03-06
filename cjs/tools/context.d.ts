export interface Context {
    [x: string]: ContextValue;
}
export declare type ContextValue = string | number | boolean | Context | ContextArray | undefined | null;
export interface ContextArray extends Array<ContextValue> {
}
export declare function withSnakeCaseKeys(candidate: Context): Context;
export declare function deepSnakeCase(candidate: ContextValue): ContextValue;
export declare function toSnakeCase(word: string): string;
export declare function combine<A, B>(a: A, b: B): A & B;
export declare function combine<A, B, C>(a: A, b: B, c: C): A & B & C;
export declare function combine<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
export declare function deepClone<T extends ContextValue>(context: T): T;
interface CircularReferenceChecker {
    hasAlreadyBeenSeen(value: Context | ContextArray): boolean;
}
export declare function createCircularReferenceChecker(): CircularReferenceChecker;
/**
 * Iterate over 'source' and affect its subvalues into 'destination', recursively.  If the 'source'
 * and 'destination' can't be merged, return 'source'.
 */
export declare function mergeInto(destination: ContextValue, source: ContextValue, circularReferenceChecker: CircularReferenceChecker): ContextValue;
export {};
