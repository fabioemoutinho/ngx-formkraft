import { Component, input } from '@angular/core';
import { FieldTree, FieldState, FormField } from '@angular/forms/signals';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-select-input',
  imports: [MatFormField, MatLabel, MatError, MatSelect, MatOption, FormField],
  template: `
    <mat-form-field appearance="outline">
      @if (label(); as l) {
        <mat-label>{{ l }}</mat-label>
      }
      <mat-select [formField]="field()">
        @for (opt of options(); track opt) {
          <mat-option [value]="opt">{{ opt }}</mat-option>
        }
      </mat-select>
      <mat-error>{{ state().errors()[0]?.message ?? state().errors()[0]?.kind }}</mat-error>
    </mat-form-field>
  `,
  styles: `:host { display: block; }`,
})
export class SelectInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly state = input.required<FieldState<string>>();

  readonly label = input('');
  readonly options = input<string[]>([]);
}
