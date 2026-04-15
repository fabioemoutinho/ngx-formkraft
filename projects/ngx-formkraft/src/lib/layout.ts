import { Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ArrayNode, ControlNode, GroupNode, LayoutNode, LayoutNodeOptions } from './layout-types';

// ── control() ──────────────────────────────────────────────────────────────

/**
 * Creates a ControlNode in the layout tree.
 *
 * The rendered component should implement `FormValueControl<T>` from `@angular/forms/signals`.
 * The renderer automatically attaches `[formField]` to bind value, errors, touched, etc.
 *
 * @example
 * control(f.name)
 * control(f.name, { type: 'text', props: { label: 'Name' } })
 * control(f.name, { component: CustomInput })
 */
export function control<T>(
  fieldRef: FieldTree<T>,
  options?: LayoutNodeOptions,
): ControlNode<T> {
  return { kind: 'control', field: fieldRef, ...options };
}

// ── group() ────────────────────────────────────────────────────────────────

/** Options for group() and array() builders. Extends LayoutNodeOptions with visibility. */
export interface ContainerOptions extends LayoutNodeOptions {
  /** Signal-based visibility. */
  hidden?: Signal<boolean>;
}

/**
 * Creates a GroupNode in the layout tree.
 *
 * @example
 * group('personal', [control(f.name), control(f.email)])
 * group('personal', { component: CardComponent, props: { title: 'Info' } }, [control(f.name)])
 * group('personal', { type: 'card' }, [control(f.name)])
 */
export function group(name: string, children: LayoutNode[]): GroupNode;
export function group(name: string, options: ContainerOptions, children: LayoutNode[]): GroupNode;
export function group(
  name: string,
  optionsOrChildren: LayoutNode[] | ContainerOptions,
  maybeChildren?: LayoutNode[],
): GroupNode {
  const isOptions = !Array.isArray(optionsOrChildren);
  const options = isOptions ? optionsOrChildren : {};
  const children = isOptions ? maybeChildren! : optionsOrChildren;

  return {
    kind: 'group',
    name,
    component: options.component,
    type: options.type,
    props: options.props,
    hidden: options.hidden,
    children,
  };
}

// ── array() ────────────────────────────────────────────────────────────────


/**
 * Creates an ArrayNode in the layout tree.
 *
 * @example
 * array(f.addresses, (addr, i) => [control(addr.street), control(addr.city)])
 * array(f.addresses, { component: RepeatableCard }, (addr, i) => [...])
 * array(f.addresses, { type: 'repeatable' }, (addr, i) => [...])
 */
export function array<TItem>(
  fieldRef: FieldTree<TItem[]>,
  itemLayout: (itemField: FieldTree<TItem>, index: number) => LayoutNode[],
): ArrayNode<TItem>;
export function array<TItem>(
  fieldRef: FieldTree<TItem[]>,
  options: ContainerOptions,
  itemLayout: (itemField: FieldTree<TItem>, index: number) => LayoutNode[],
): ArrayNode<TItem>;
export function array<TItem>(
  fieldRef: FieldTree<TItem[]>,
  optionsOrLayout:
    | ((itemField: FieldTree<TItem>, index: number) => LayoutNode[])
    | ContainerOptions,
  maybeLayout?: (itemField: FieldTree<TItem>, index: number) => LayoutNode[],
): ArrayNode<TItem> {
  const isOptions = typeof optionsOrLayout !== 'function';
  const options = isOptions ? optionsOrLayout : {};
  const itemLayout = isOptions ? maybeLayout : optionsOrLayout;

  return {
    kind: 'array',
    field: fieldRef,
    component: options.component,
    type: options.type,
    props: options.props,
    hidden: options.hidden,
    itemLayout,
  };
}

// ── layout() ───────────────────────────────────────────────────────────────

/**
 * Creates a reactive layout function for a form.
 * The function receives the form's FieldTree<T> for type-safe path access.
 *
 * Returns a thunk `() => LayoutNode[]` evaluated inside `<fk-form>`'s computed().
 * Reading signals inside `fn` makes the layout automatically reactive.
 *
 * @example
 * const myLayout = layout(userForm, f => [
 *   group('basics', { type: 'card' }, [
 *     control(f.name, { type: 'text', props: { label: 'Name' } }),
 *     control(f.email),
 *   ]),
 *   array(f.addresses, (addr, i) => [
 *     control(addr.street),
 *     control(addr.city),
 *   ]),
 * ]);
 */
export function layout<T>(
  formRef: FieldTree<T>,
  fn: (f: FieldTree<T>) => LayoutNode[],
): () => LayoutNode[] {
  return () => fn(formRef);
}
