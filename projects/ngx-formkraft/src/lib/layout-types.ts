import { Signal, Type } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from './types';

/**
 * Shared options for component resolution on any layout node.
 */
export interface LayoutNodeOptions {
  /** Direct component type. Takes precedence over `type`. */
  component?: Type<unknown>;
  /** String type key, resolved via the type registry. */
  type?: string;
  /** Props passed to the resolved component via inputBinding(). */
  props?: Record<string, unknown | (() => unknown)>;
}

/**
 * A leaf node that renders a single form field.
 * Field visibility is driven by signal forms' `hidden()` — not duplicated here.
 */
export interface FieldNode<TValue = unknown> extends LayoutNodeOptions {
  readonly kind: 'field';
  /** Reference to the signal form field. */
  readonly field: FieldTree<TValue>;
  /** Inline rendering overrides (merged with FieldDefs during resolution). */
  readonly def?: FieldDef<TValue>;
}

/**
 * A grouping node that renders children inside an optional wrapper component.
 */
export interface GroupNode extends LayoutNodeOptions {
  readonly kind: 'group';
  /** Identifier for the group (used for labeling, CSS hooks, etc.). */
  readonly name: string;
  /** Signal-based visibility for groups (no corresponding Field with hidden()). */
  readonly hidden?: Signal<boolean>;
  /** Child layout nodes. */
  readonly children: LayoutNode[];
}

/**
 * A repeating node for array fields.
 */
export interface ArrayNode<TItem = unknown> extends LayoutNodeOptions {
  readonly kind: 'array';
  /** Reference to the array field. */
  readonly field: FieldTree<TItem[]>;
  /** Signal-based visibility for arrays (no corresponding Field with hidden()). */
  readonly hidden?: Signal<boolean>;
  /** Layout function for each item. Receives the field for a single array element and its index. */
  readonly itemLayout?: (itemField: FieldTree<TItem>, index: number) => LayoutNode[];
}

/** Union of all layout node types. */
export type LayoutNode = FieldNode | GroupNode | ArrayNode;
