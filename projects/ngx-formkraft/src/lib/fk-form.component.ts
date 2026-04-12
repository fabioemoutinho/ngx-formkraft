import {
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FkNodeComponent } from './fk-node.component';
import { ControlNode, LayoutNode, LayoutNodeOptions } from './layout-types';
import { FieldDefs } from './types';

/**
 * Top-level form renderer component.
 * Takes a signal form, optional field definitions, and optional layout,
 * then auto-renders the entire form.
 *
 * @example
 * <fk-form [form]="userForm" [fieldDefs]="fieldDefs" [layout]="userLayout" />
 */
@Component({
  selector: 'fk-form',
  imports: [FkNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (node of resolvedLayout(); track trackNode(node, $index)) {
      <fk-node [node]="node" [fieldDefs]="fieldDefs()" />
    }
  `,
})
export class FkFormComponent<T> {
  /** The signal form FieldTree. */
  readonly form = input.required<FieldTree<T>>();

  /** Field definitions map. Provides default rendering metadata per field. */
  readonly fieldDefs = input<FieldDefs<T>>();

  /** Layout function. If omitted, fields render in definition order using fieldDefs. */
  readonly layout = input<() => LayoutNode[]>();

  /** Resolved layout: from layout function or auto-generated from field keys. */
  protected readonly resolvedLayout = computed(() => {
    const layoutFn = this.layout();
    return layoutFn ? layoutFn() : this.autoLayout();
  });

  protected trackNode(node: LayoutNode, index: number): string {
    switch (node.kind) {
      case 'control':
        return `control-${index}`;
      case 'group':
        return `group-${node.name}`;
      case 'array':
        return `array-${index}`;
      default:
        return `node-${index}`;
    }
  }

  /**
   * Auto-generates a flat layout from the form's field keys + fieldDefs.
   * Used when no explicit layout is provided.
   *
   * FieldTree<T> implements Symbol.iterator, yielding [key, FieldTree] entries.
   */
  private autoLayout(): LayoutNode[] {
    const f = this.form();
    const defs = this.fieldDefs();
    const nodes: ControlNode[] = [];

    for (const [key, fieldTree] of f as Iterable<[string, FieldTree<unknown>]>) {
      const options = defs?.[key as keyof T] as LayoutNodeOptions | undefined;
      nodes.push({ kind: 'control', field: fieldTree, ...options });
    }

    return nodes;
  }
}
