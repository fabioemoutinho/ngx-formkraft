import { Component, input } from '@angular/core';
import { FieldTree, FieldState, FormField } from '@angular/forms/signals';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-textarea-input',
  imports: [MatFormField, MatLabel, MatInput, MatError, FormField],
  template: `
    <mat-form-field appearance="outline">
      @if (label(); as l) {
        <mat-label>{{ l }}</mat-label>
      }
      <textarea matInput
        [rows]="rows()"
        [placeholder]="placeholder()"
        [formField]="field()">
      </textarea>
      <mat-error>{{ state().errors()[0]?.message ?? state().errors()[0]?.kind }}</mat-error>
    </mat-form-field>
  `,
  styles: `:host { display: block; }`,
})
export class TextareaInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly state = input.required<FieldState<string>>();

  readonly label = input('');
  readonly placeholder = input('');
  readonly rows = input(4);
}
