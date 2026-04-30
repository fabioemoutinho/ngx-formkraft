import { Signal, Type } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Shared options for component resolution on any layout node.
 */
export interface LayoutNodeOptions {
  /** Direct component type. Takes precedence over `type`. */
  component?: Type<unknown>;
  /** String type key, resolved via the type registry. */
  type?: string;
  /** Props passed to the resolved component. Signals are subscribed automatically. */
  props?: Record<string, unknown>;
}

/**
 * A control node that renders a form control component.
 *
 * The component should implement `FormValueControl<T>` from `@angular/forms/signals`,
 * or receive `field` and `state` inputs and use `[formField]` internally.
 */
export interface ControlNode<TValue = unknown> extends LayoutNodeOptions {
  readonly kind: 'control';
  /** Reference to the signal form field. */
  readonly field: FieldTree<TValue>;
}

/**
 * A collection node — children are keyed by name.
 * Wrapper components receive a `Record<string, LayoutNode>` and can place
 * children by key in specific template locations, or iterate all values.
 */
export interface GroupNode extends LayoutNodeOptions {
  readonly kind: 'group';
  /** Identifier for the group. */
  readonly name: string;
  /** Signal-based visibility. */
  readonly hidden?: Signal<boolean>;
  /** Keyed child layout nodes. */
  readonly children: Record<string, LayoutNode>;
}

/**
 * An ordered sequence node — children are rendered in order.
 * Wrapper components receive a `LayoutNode[]` and iterate them sequentially
 * (e.g., steppers, numbered lists, timelines).
 */
export interface ArrayNode extends LayoutNodeOptions {
  readonly kind: 'array';
  /** Identifier for the array. */
  readonly name: string;
  /** Signal-based visibility. */
  readonly hidden?: Signal<boolean>;
  /** Ordered child layout nodes. */
  readonly children: LayoutNode[];
}

/** Union of all layout node types. */
export type LayoutNode = ControlNode | GroupNode | ArrayNode;
