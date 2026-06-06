import {
  Component,
  input,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { SfrNodeComponent } from './sfr-node.component';
import { LayoutNode } from './layout-types';

/**
 * Top-level form renderer component.
 * Takes a signal form and a layout function, then renders the form.
 *
 * @example
 * <sfr-form [form]="userForm" [layout]="userLayout" />
 */
@Component({
  selector: 'sfr-form',
  imports: [SfrNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (node of layout()(); track node) {
      <sfr-node [node]="node" />
    }
  `,
})
export class SfrFormComponent<T> {
  /** The signal form FieldTree. */
  readonly form = input.required<FieldTree<T>>();

  /** Layout function. Produced by the layout() builder. */
  readonly layout = input.required<Signal<LayoutNode[]>>();
}
