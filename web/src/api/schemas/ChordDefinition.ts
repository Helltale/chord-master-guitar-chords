/** Generated from OpenAPI schema "ChordDefinition". Do not edit. */

import type { ChordBarre } from './ChordBarre';

export type ChordDefinition = {
  name: string;
  shape: string;
  barre?: ChordBarre;
  is_preset: boolean;
  sort_order: number;
};
