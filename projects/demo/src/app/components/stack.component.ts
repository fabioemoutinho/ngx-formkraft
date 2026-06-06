import { Component, input } from '@angular/core';
import { SfrChildrenComponent, LayoutNode } from 'ngx-signal-forms-renderer';

/**
 * A vertical layout container: stacks its child nodes with a consistent gap.
 * Used as the form's root so spacing between top-level sections lives in the layout
 * (a component) rather than as ambient CSS on the renderer. Reusable anywhere a
 * gapped vertical stack of nodes is needed.
 */
@Component({
  selector: 'app-stack',
  imports: [SfrChildrenComponent],
  template: `<sfr-children [children]="children()" />`,
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; }
  `,
})
export class StackComponent {
  readonly children = input.required<LayoutNode[]>();
}
