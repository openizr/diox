/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mixed } from 'scripts/types';

export default function Store(): mixed {
  return {
    subscribe: jest.fn((_hash, callback) => {
      callback({ count: 5 });
      return 1;
    }),
    unsubscribe: jest.fn(),
    dispatch: jest.fn(),
    mutate: jest.fn(),
    combiners: {
      combiner: {
        mapper: {
          module: (newState: mixed): mixed => newState,
        },
        subscriptions: [],
      },
    },
    modules: {
      module: { state: { value: 'test' } },
    },
  };
}
