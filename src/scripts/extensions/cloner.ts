/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mixed } from 'scripts/types';
import isPlainObject from 'is-plain-object';

/**
 * Performs a deep copy of a variable. Only plain objects and arrays are deeply copied.
 *
 * @param {mixed} variable Variable to deeply copy.
 *
 * @returns {mixed} Variable's deep copy.
 */
export function deepCopy(variable: mixed): mixed {
  if (isPlainObject(variable)) {
    return Object.keys(variable).reduce(
      (newObject, key) => Object.assign(newObject, {
        [key]: deepCopy(variable[key]),
      }),
      {},
    );
  }
  if (Array.isArray(variable)) {
    return variable.map(deepCopy);
  }
  return variable;
}

/**
 * Performs a deep merge of two plain objects. Only plain objects and arrays are deeply copied.
 *
 * @param {Record<string, mixed>} firstObject First object.
 *
 * @param {Record<string, mixed>} secondObject Second object.
 *
 * @param {bool} [mergeArrays = false] Whether to merge objects arrays instead of replacing them.
 *
 * @returns {Record<string, mixed>} A new object resulting of merging of the two others.
 *
 * @throws {Error} If one of the arguments is not a plain object.
 */
export function deepMerge(
  firstObject: Record<string, mixed>,
  secondObject: Record<string, mixed>,
  mergeArrays = false,
): Record<string, mixed> {
  if (!isPlainObject(firstObject) || !isPlainObject(secondObject)) {
    throw new Error('Arguments must both be plain objects.');
  }
  const newObject = deepCopy(firstObject);
  Object.keys(secondObject).forEach((key) => {
    if (isPlainObject(firstObject[key]) && isPlainObject(secondObject[key])) {
      newObject[key] = deepMerge(firstObject[key], secondObject[key]);
    } else if (Array.isArray(firstObject[key]) && Array.isArray(secondObject[key]) && mergeArrays) {
      newObject[key] = newObject[key].concat(deepCopy(secondObject[key]));
    } else {
      newObject[key] = deepCopy(secondObject[key]);
    }
  });
  return newObject;
}
