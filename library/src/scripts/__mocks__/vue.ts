/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default {
  extend: jest.fn((firstObject) => ({
    ...firstObject.mixins[0],
    ...firstObject.mixins[1],
    data: { ...firstObject.mixins[0].data() },
  })),
};
