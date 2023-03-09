/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const ref = jest.fn(() => ({ value: 'test' }));
export const onMounted = jest.fn((callback) => callback());
export const onUnmounted = jest.fn((callback) => callback());
