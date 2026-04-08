import { Signal, Type } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from './types';
import { ArrayNode, FieldNode, GroupNode, LayoutNode } from './layout-types';

// ── field() ────────────────────────────────────────────────────────────────

/**
 * Creates a FieldNode in the layout tree.
 *
 * @example
 * field(f.name)
 * field(f.name, { type: 'text', props: { label: 'Name' } })
 * field(f.name, { component: CustomInput })
 */
export function field<T>(
  fieldRef: FieldTree<T>,
  def?: FieldDef<T>,
): FieldNode<T> {
  return { kind: 'field', field: fieldRef, def };
}

// ── group() ────────────────────────────────────────────────────────────────

export interface GroupOptions {
  /** Direct component type for the group wrapper. */
  component?: Type<unknown>;
  /** String type key, resolved via the registry. */
  type?: string;
  /** Props passed to the group wrapper component. */
  props?: Record<string, unknown | (() => unknown)>;
  /** Signal-based visibility for the group. */
  hidden?: Signal<boolean>;
}

/**
 * Creates a GroupNode in the layout tree.
 *
 * @example
 * group('personal', [field(f.name), field(f.email)])
 * group('personal', { component: CardComponent, props: { title: 'Info' } }, [field(f.name)])
 * group('personal', { type: 'card' }, [field(f.name)])
 */
export function group(name: string, children: LayoutNode[]): GroupNode;
export function group(name: string, options: GroupOptions, children: LayoutNode[]): GroupNode;
export function group(
  name: string,
  optionsOrChildren: LayoutNode[] | GroupOptions,
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

export interface ArrayOptions {
  /** Direct component type for the array container. */
  component?: Type<unknown>;
  /** String type key, resolved via the registry. */
  type?: string;
  /** Props passed to the array container component. */
  props?: Record<string, unknown | (() => unknown)>;
  /** Signal-based visibility for the array. */
  hidden?: Signal<boolean>;
}

/**
 * Creates an ArrayNode in the layout tree.
 *
 * @example
 * array(f.addresses, (addr, i) => [field(addr.street), field(addr.city)])
 * array(f.addresses, { component: RepeatableCard }, (addr, i) => [...])
 * array(f.addresses, { type: 'repeatable' }, (addr, i) => [...])
 */
export function array<TItem>(
  fieldRef: FieldTree<TItem[]>,
  itemLayout: (itemField: FieldTree<TItem>, index: number) => LayoutNode[],
): ArrayNode<TItem>;
export function array<TItem>(
  fieldRef: FieldTree<TItem[]>,
  options: ArrayOptions,
  itemLayout: (itemField: FieldTree<TItem>, index: number) => LayoutNode[],
): ArrayNode<TItem>;
export function array<TItem>(
  fieldRef: FieldTree<TItem[]>,
  optionsOrLayout:
    | ((itemField: FieldTree<TItem>, index: number) => LayoutNode[])
    | ArrayOptions,
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
 *     field(f.name, { type: 'text', props: { label: 'Name' } }),
 *     field(f.email),
 *   ]),
 *   array(f.addresses, (addr, i) => [
 *     field(addr.street),
 *     field(addr.city),
 *   ]),
 * ]);
 */
export function layout<T>(
  formRef: FieldTree<T>,
  fn: (f: FieldTree<T>) => LayoutNode[],
): () => LayoutNode[] {
  return () => fn(formRef);
}
