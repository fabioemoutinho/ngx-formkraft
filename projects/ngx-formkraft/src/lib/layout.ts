import { Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ArrayNode, ControlNode, GroupNode, LayoutNode, LayoutNodeOptions } from './layout-types';

// ── control() ──────────────────────────────────────────────────────────────

/**
 * Creates a ControlNode in the layout tree.
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

// ── Shared options ────────────────────────────────────────────────────────

/** Options for group() and array() builders. Extends LayoutNodeOptions with visibility. */
export interface ContainerOptions extends LayoutNodeOptions {
  /** Signal-based visibility. */
  hidden?: Signal<boolean>;
}

// ── group() ────────────────────────────────────────────────────────────────

/**
 * Creates a GroupNode (keyed collection) in the layout tree.
 * Wrapper components receive children as a Record and can place them by key.
 *
 * @example
 * group('personal', { name: control(f.name), email: control(f.email) })
 * group('personal', { component: TwoColumn }, { name: control(f.name), email: control(f.email) })
 */
export function group(name: string, children: Record<string, LayoutNode>): GroupNode;
export function group(name: string, options: ContainerOptions, children: Record<string, LayoutNode>): GroupNode;
export function group(
  name: string,
  optionsOrChildren: Record<string, LayoutNode> | ContainerOptions,
  maybeChildren?: Record<string, LayoutNode>,
): GroupNode {
  const hasOptions = maybeChildren !== undefined;
  const options = hasOptions ? (optionsOrChildren as ContainerOptions) : {};
  const children = hasOptions ? maybeChildren! : (optionsOrChildren as Record<string, LayoutNode>);

  return {
    kind: 'group',
    name,
    ...options,
    children,
  };
}

// ── array() ────────────────────────────────────────────────────────────────

/**
 * Creates an ArrayNode (ordered sequence) in the layout tree.
 * Wrapper components receive children as an array and iterate them in order.
 *
 * @example
 * array('steps', [control(f.step1), control(f.step2)])
 * array('steps', { component: Stepper }, [control(f.step1), control(f.step2)])
 */
export function array(name: string, children: LayoutNode[]): ArrayNode;
export function array(name: string, options: ContainerOptions, children: LayoutNode[]): ArrayNode;
export function array(
  name: string,
  optionsOrChildren: LayoutNode[] | ContainerOptions,
  maybeChildren?: LayoutNode[],
): ArrayNode {
  const isOptions = !Array.isArray(optionsOrChildren);
  const options = isOptions ? optionsOrChildren : {};
  const children = isOptions ? maybeChildren! : optionsOrChildren;

  return {
    kind: 'array',
    name,
    ...options,
    children,
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
 *   group('basics', { type: 'card' }, {
 *     name: control(f.name, { type: 'text', props: { label: 'Name' } }),
 *     email: control(f.email),
 *   }),
 * ]);
 */
export function layout<T>(
  formRef: FieldTree<T>,
  fn: (f: FieldTree<T>) => LayoutNode[],
): () => LayoutNode[] {
  return () => fn(formRef);
}
