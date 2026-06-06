import { Component, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { SfrChildrenComponent, LayoutNode } from 'ngx-signal-forms-renderer';

@Component({
  selector: 'app-card-group',
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, SfrChildrenComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <sfr-children [children]="children()" />
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host { display: block; margin-bottom: 16px; }
    mat-card-content { padding-top: 16px; }
  `,
})
export class CardGroupComponent {
  readonly title = input('');
  readonly children = input.required<Record<string, LayoutNode>>();
}
