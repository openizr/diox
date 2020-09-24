/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mixed } from 'scripts/types';
import { deepCopy, deepMerge } from 'scripts/extensions/cloner';

describe('extensions/cloner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deepCopy', () => {
    test('should deeply copy nested plain objects', () => {
      const source = {
        firstKey: {
          a: 'test',
          b: {
            c: 'test',
          },
        },
        secondKey: 14,
        thirdKey: [{ a: 'test' }],
      };
      const copy = deepCopy(source);
      expect(copy).toEqual(source);
      expect(copy).not.toBe(source);
      expect(copy.firstKey).toEqual(source.firstKey);
      expect(copy.firstKey).not.toBe(source.firstKey);
      expect(copy.firstKey.b).toEqual(source.firstKey.b);
      expect(copy.firstKey.b).not.toBe(source.firstKey.b);
      expect(copy.thirdKey).toEqual(source.thirdKey);
      expect(copy.thirdKey).not.toBe(source.thirdKey);
      expect(copy.thirdKey[0]).toEqual(source.thirdKey[0]);
      expect(copy.thirdKey[0]).not.toBe(source.thirdKey[0]);
    });
  });

  describe('deepMerge', () => {
    test('should throw if one of the arguments is not a plain object', () => {
      const firstObject = 3;
      const secondObject = {
        firstKey: {
          a: 'test new',
          b: 'ok',
          c: { a: 'test' },
        },
        secondKey: 14,
        thirdKey: [{ a: 'new' }],
      };
      expect(() => {
        deepMerge(firstObject as mixed, secondObject);
      }).toThrow(new Error('Arguments must both be plain objects.'));
    });

    test('should deeply merge nested plain objects', () => {
      const firstObject = {
        firstKey: {
          a: 'test',
          b: {
            c: 'test',
          },
        },
        secondKey: 14,
        thirdKey: [{ a: 'test' }],
      };
      const secondObject = {
        firstKey: {
          a: 'test new',
          b: 'ok',
          c: { a: 'test' },
        },
        secondKey: 15,
        thirdKey: [{ a: 'new' }],
      };
      const merge = deepMerge(firstObject, secondObject);
      expect(merge).toEqual({
        firstKey: {
          a: 'test new',
          b: 'ok',
          c: { a: 'test' },
        },
        secondKey: 15,
        thirdKey: [{ a: 'new' }],
      });
    });

    test('should merge arrays if `mergeArrays` is set to `true`', () => {
      const firstObject = {
        key: [{ a: 'test' }],
      };
      const secondObject = {
        key: [{ a: 'new' }],
      };
      const merge = deepMerge(firstObject, secondObject, true);
      expect(merge).toEqual({
        key: [{ a: 'test' }, { a: 'new' }],
      });
    });
  });
});
