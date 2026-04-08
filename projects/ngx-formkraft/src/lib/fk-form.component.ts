import {
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FkNodeComponent } from './fk-node.component';
import { FieldNode, LayoutNode } from './layout-types';
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
  standalone: true,
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
  readonly resolvedLayout = computed(() => {
    const layoutFn = this.layout();
    if (layoutFn) {
      return layoutFn();
    }
    return this.autoLayout();
  });

  trackNode(node: LayoutNode, index: number): string {
    switch (node.kind) {
      case 'field':
        return `field-${index}`;
      case 'group':
        return `group-${node.name}`;
      case 'array':
        return `array-${index}`;
    }
  }

  /**
   * Auto-generates a flat layout from the form's field keys + fieldDefs.
   * Used when no explicit layout is provided.
   */
  private autoLayout(): LayoutNode[] {
    const f = this.form();
    const defs = this.fieldDefs();

    // FieldTree<T> for objects has properties matching T's keys
    const nodes: FieldNode[] = [];
    for (const [key, fieldTree] of f as any) {
      const def = defs ? (defs as any)[key] : undefined;
      nodes.push({
        kind: 'field',
        field: fieldTree as FieldTree<unknown>,
        def,
      });
    }
    return nodes;
  }
}
