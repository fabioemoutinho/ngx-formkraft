import { Component, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FkChildrenComponent, LayoutNode } from 'ngx-formkraft';

@Component({
  selector: 'app-card-group',
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, FkChildrenComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <fk-children [children]="children()" />
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
  readonly children = input.required<Record<string, LayoutNode>>();
}
