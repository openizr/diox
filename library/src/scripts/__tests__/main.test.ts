/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'scripts/main';

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly export Store', () => {
    expect(Store).not.toBe(null);
  });
});
