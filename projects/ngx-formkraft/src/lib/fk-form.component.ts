import {
  Component,
  input,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FkNodeComponent } from './fk-node.component';
import { LayoutNode } from './layout-types';

/**
 * Top-level form renderer component.
 * Takes a signal form and a layout function, then renders the form.
 *
 * @example
 * <fk-form [form]="userForm" [layout]="userLayout" />
 */
@Component({
  selector: 'fk-form',
  imports: [FkNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (node of layout()(); track node) {
      <fk-node [node]="node" />
    }
  `,
})
export class FkFormComponent<T> {
  /** The signal form FieldTree. */
  readonly form = input.required<FieldTree<T>>();

  /** Layout function. Produced by the layout() builder. */
  readonly layout = input.required<Signal<LayoutNode[]>>();
}
