import { LayoutNodeOptions } from './layout-types';

/**
 * Map of field keys to their rendering definitions.
 * Supports nested objects matching the form model structure.
 *
 * Each entry is a {@link LayoutNodeOptions} (component, type, props)
 * or a nested `FieldDefs` for object-typed fields.
 */
export type FieldDefs<T> = {
  [K in keyof T]?: T[K] extends ReadonlyArray<unknown>
    ? LayoutNodeOptions
    : T[K] extends Record<string, unknown>
      ? LayoutNodeOptions | FieldDefs<T[K]>
      : LayoutNodeOptions;
};
