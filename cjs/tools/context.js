"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function withSnakeCaseKeys(candidate) {
    var result = {};
    Object.keys(candidate).forEach(function (key) {
        result[toSnakeCase(key)] = deepSnakeCase(candidate[key]);
    });
    return result;
}
exports.withSnakeCaseKeys = withSnakeCaseKeys;
function deepSnakeCase(candidate) {
    if (Array.isArray(candidate)) {
        return candidate.map(function (value) { return deepSnakeCase(value); });
    }
    if (typeof candidate === 'object' && candidate !== null) {
        return withSnakeCaseKeys(candidate);
    }
    return candidate;
}
exports.deepSnakeCase = deepSnakeCase;
function toSnakeCase(word) {
    return word
        .replace(/[A-Z]/g, function (uppercaseLetter, index) { return "" + (index !== 0 ? '_' : '') + uppercaseLetter.toLowerCase(); })
        .replace(/-/g, '_');
}
exports.toSnakeCase = toSnakeCase;
var isContextArray = function (value) { return Array.isArray(value); };
var isContext = function (value) {
    return !Array.isArray(value) && typeof value === 'object' && value !== null;
};
function combine() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var destination;
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        // Ignore any undefined or null sources.
        if (source === undefined || source === null) {
            continue;
        }
        destination = mergeInto(destination, source, createCircularReferenceChecker());
    }
    return destination;
}
exports.combine = combine;
/*
 * Performs a deep clone of objects and arrays.
 * - Circular references are replaced by 'undefined'
 */
function deepClone(context) {
    return mergeInto(undefined, context, createCircularReferenceChecker());
}
exports.deepClone = deepClone;
function createCircularReferenceChecker() {
    if (typeof WeakSet !== 'undefined') {
        var set_1 = new WeakSet();
        return {
            hasAlreadyBeenSeen: function (value) {
                var has = set_1.has(value);
                if (!has) {
                    set_1.add(value);
                }
                return has;
            },
        };
    }
    var array = [];
    return {
        hasAlreadyBeenSeen: function (value) {
            var has = array.indexOf(value) >= 0;
            if (!has) {
                array.push(value);
            }
            return has;
        },
    };
}
exports.createCircularReferenceChecker = createCircularReferenceChecker;
/**
 * Iterate over 'source' and affect its subvalues into 'destination', recursively.  If the 'source'
 * and 'destination' can't be merged, return 'source'.
 */
function mergeInto(destination, source, circularReferenceChecker) {
    // Ignore the 'source' if it is undefined
    if (source === undefined) {
        return destination;
    }
    // If the 'source' is not an object or array, it can't be merged with 'destination' in any way, so
    // return it directly.
    if (!isContext(source) && !isContextArray(source)) {
        return source;
    }
    // Return 'undefined' if we already iterated over this 'source' to avoid infinite recursion
    if (circularReferenceChecker.hasAlreadyBeenSeen(source)) {
        return undefined;
    }
    // 'source' and 'destination' are objects, merge them together
    if (isContext(source) && (destination === undefined || isContext(destination))) {
        var finalDestination = destination || {};
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                finalDestination[key] = mergeInto(finalDestination[key], source[key], circularReferenceChecker);
            }
        }
        return finalDestination;
    }
    // 'source' and 'destination' are arrays, merge them together
    if (isContextArray(source) && (destination === undefined || isContextArray(destination))) {
        var finalDestination = destination || [];
        finalDestination.length = Math.max(finalDestination.length, source.length);
        for (var index = 0; index < source.length; index += 1) {
            finalDestination[index] = mergeInto(finalDestination[index], source[index], circularReferenceChecker);
        }
        return finalDestination;
    }
    // The destination in not an array nor an object, so we can't merge it
    return source;
}
exports.mergeInto = mergeInto;
//# sourceMappingURL=context.js.map