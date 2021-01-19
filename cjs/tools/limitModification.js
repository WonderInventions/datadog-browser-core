"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context");
/**
 * Current limitations:
 * - field path do not support array, 'a.b.c' only
 * - modifiable fields type must be string
 */
function limitModification(object, modifiableFieldPaths, modifier) {
    var clone = context_1.deepClone(object);
    try {
        modifier(clone);
    }
    catch (e) {
        console.error(e);
        return object;
    }
    modifiableFieldPaths.forEach(function (path) {
        var originalValue = get(object, path);
        var newValue = get(clone, path);
        if (typeof originalValue === 'string' && typeof newValue === 'string') {
            set(object, path, newValue);
        }
    });
    return object;
}
exports.limitModification = limitModification;
function get(object, path) {
    var current = object;
    for (var _i = 0, _a = path.split('.'); _i < _a.length; _i++) {
        var field = _a[_i];
        if (!isValidObjectContaining(current, field)) {
            return;
        }
        current = current[field];
    }
    return current;
}
function set(object, path, value) {
    var current = object;
    var fields = path.split('.');
    for (var i = 0; i < fields.length; i += 1) {
        var field = fields[i];
        if (!isValidObjectContaining(current, field)) {
            return;
        }
        if (i !== fields.length - 1) {
            current = current[field];
        }
        else {
            current[field] = value;
        }
    }
}
function isValidObjectContaining(object, field) {
    return typeof object === 'object' && object !== null && field in object;
}
//# sourceMappingURL=limitModification.js.map