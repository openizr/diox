/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Vue, { Component } from 'vue';
import { Json, Reducer, Store } from 'scripts/types';

/** Function that exposes Store's public methods to component for internal use. */
type connector = (publicApi: {
  dispatch: (hash: string, mutation: Json) => void;
  mutate: (hash: string, mutation: Json) => void;
}) => Component;

interface Mapper {
  [moduleHash: string]: Reducer;
}

/**
 * Connects the given diox Store to VueJS component. Once component is mounted in the DOM, it
 * automatically subscribes to modules and combiners specified in the mapper, and its data is
 * filled with those values. All subscriptions are removed right before destroying component.
 *
 * @param {Store} store diox Store to bind to the component.
 *
 * @param {Mapper} mapper diox Mapper to register on component mounting.
 *
 * @returns {Component} VueJS connected component.
 */
export default function connect(store: Store, mapper: Mapper) {
  return (bindComponent: connector): Component => {
    const Container: Component = bindComponent({
      dispatch: store.dispatch.bind(store),
      mutate: store.mutate.bind(store),
    });
    return Vue.extend({
      mixins: [
        {
          /** List of component's subscriptions ids to the store. */
          $subscriptions: [],

          /** Subscribes to all modules and combiners defined in mapper. */
          mounted(): void {
            this.$subscriptions = [];
            Object.keys(mapper).forEach((hash: string) => {
              this.$subscriptions.push(
                store.subscribe(hash, (newState: Json) => {
                  const newData = mapper[hash](newState);
                  Object.keys(newData).forEach((key: string) => {
                    this[key] = newData[key];
                  });
                }),
              );
            });
          },

          /** Unsubscribes from all modules and combiners defined in mapper. */
          beforeDestroy(): void {
            Object.keys(mapper).forEach((combiner) => {
              store.unsubscribe(combiner, this.$subscriptions.shift());
            });
          },
        } as {
          [key: string]: Json;
        },

        // Actual component.
        Container,
      ],
    });
  };
}
