import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [MatFormField, MatLabel, MatSelect, MatOption],
  template: `
    <mat-form-field appearance="outline">
      @if (label(); as l) {
        <mat-label>{{ l }}</mat-label>
      }
      <mat-select
        [value]="field()().value()"
        (selectionChange)="field()().value.set($event.value)">
        @for (opt of options(); track opt) {
          <mat-option [value]="opt">{{ opt }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: `:host { display: block; }`,
})
export class SelectInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly label = input('');
  readonly options = input<string[]>([]);
}
