import { Component, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FkRenderChildrenComponent, LayoutNode, FieldDefs } from 'ngx-formkraft';

@Component({
  selector: 'app-card-group',
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, FkRenderChildrenComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <fk-render-children [children]="children()" [fieldDefs]="fieldDefs()" />
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host { display: block; margin-bottom: 16px; }
    mat-card-content { padding-top: 16px; }
  `,
})
export class CardGroupComponent {
  readonly name = input.required<string>();
  readonly title = input('');
  readonly children = input.required<LayoutNode[]>();
  readonly fieldDefs = input<FieldDefs<unknown>>();
}
