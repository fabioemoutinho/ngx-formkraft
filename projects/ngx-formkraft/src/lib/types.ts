import { Type } from '@angular/core';

/**
 * Rendering instruction for a single field.
 * Tells the renderer which component to use and what props to pass.
 */
export interface FieldDef<TValue = unknown> {
  /** Direct component type. Takes precedence over `type`. */
  component?: Type<unknown>;
  /** String type key, resolved via the type registry. */
  type?: string;
  /** Props passed to the component as inputs via inputBinding(). */
  props?: Record<string, unknown | (() => unknown)>;
}

/**
 * Map of field keys to their rendering definitions.
 * Supports nested objects matching the form model structure.
 */
export type FieldDefs<T> = {
  [K in keyof T]?: T[K] extends ReadonlyArray<any>
    ? FieldDef<T[K]>
    : T[K] extends Record<string, any>
      ? FieldDef<T[K]> | FieldDefs<T[K]>
      : FieldDef<T[K]>;
};
