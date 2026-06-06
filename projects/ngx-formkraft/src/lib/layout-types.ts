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
  /**
   * Layout-level visibility override. When provided, it takes precedence over the
   * related field's native `hidden()`. Use it to hide layout elements that don't map
   * to a form field (or to override one that does).
   */
  hidden?: Signal<boolean>;
}

/**
 * A control node that renders a form control component.
 *
 * The component should implement `FormValueControl<T>` from `@angular/forms/signals`
 * (its value/errors/touched/disabled are then bound automatically via `[formField]`),
 * or otherwise receive the `field` and `state` inputs and wire `[formField]` itself.
 */
export interface ControlNode<TValue = unknown> extends LayoutNodeOptions {
  readonly kind: 'control';
  readonly field: FieldTree<TValue>;
}

/**
 * A group node — keyed collection of child nodes. Wrapper components receive
 * `children: Record<string, LayoutNode>` and can place children by key in specific
 * template locations, or iterate all values.
 *
 * `field` is set when the group is data-driven (`group(f.address, ...)`), so its
 * visibility can defer to that field's native `hidden()`. Explicit-children groups
 * (`group({ ... })`) have no field.
 */
export interface GroupNode extends LayoutNodeOptions {
  readonly kind: 'group';
  readonly children: Record<string, LayoutNode>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly field?: FieldTree<any>;
}

/**
 * An array node — either a static ordered list or data-driven from a FieldTree<T[]>.
 *
 * Three modes:
 * - Static:           children: LayoutNode[]                  (renderer receives children)
 * - Renderer-owned:   field: FieldTree<T[]>                   (renderer receives field)
 * - Library-iterated: field: FieldTree<T[]> + itemLayout fn   (fk-node iterates reactively)
 */
export interface ArrayNode extends LayoutNodeOptions {
  readonly kind: 'array';
  readonly children?: LayoutNode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly field?: FieldTree<any[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly itemLayout?: (item: FieldTree<any>) => LayoutNode;
}

/** Union of all layout node types. */
export type LayoutNode = ControlNode | GroupNode | ArrayNode;
