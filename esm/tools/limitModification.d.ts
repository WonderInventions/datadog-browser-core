import { Context } from './context';
/**
 * Current limitations:
 * - field path do not support array, 'a.b.c' only
 * - modifiable fields type must be string
 */
export declare function limitModification<T extends Context>(object: T, modifiableFieldPaths: string[], modifier: (object: T) => void): T;
