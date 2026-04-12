import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { FkNodeComponent } from './fk-node.component';
import { LayoutNode } from './layout-types';
import { FieldDefs } from './types';

/**
 * Helper component for custom group wrappers.
 * Renders an array of layout children using `<fk-node>`.
 *
 * @example
 * // In a custom group component:
 * @Component({
 *   template: `
 *     <mat-card>
 *       <mat-card-header>{{ title() }}</mat-card-header>
 *       <mat-card-content>
 *         <fk-render-children [children]="children()" [fieldDefs]="fieldDefs()" />
 *       </mat-card-content>
 *     </mat-card>
 *   `,
 *   imports: [FkRenderChildrenComponent],
 * })
 * export class CardGroupComponent {
 *   title = input('');
 *   children = input.required<LayoutNode[]>();
 *   fieldDefs = input<FieldDefs<unknown>>();
 * }
 */
@Component({
  selector: 'fk-render-children',
  imports: [FkNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (child of children(); track $index) {
      <fk-node [node]="child" [fieldDefs]="fieldDefs()" />
    }
  `,
})
export class FkRenderChildrenComponent {
  readonly children = input.required<LayoutNode[]>();
  readonly fieldDefs = input<FieldDefs<unknown>>();
}
