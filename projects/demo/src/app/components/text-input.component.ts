import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput, MatError],
  template: `
    <mat-form-field appearance="outline">
      @if (label(); as l) {
        <mat-label>{{ l }}</mat-label>
      }
      <input matInput
        [type]="inputType()"
        [placeholder]="placeholder()"
        [value]="field()().value()"
        (input)="onInput($event)"
        (blur)="field()().markAsTouched()" />
      @if (field()().touched() && field()().errors().length) {
        <mat-error>{{ field()().errors()[0].message ?? field()().errors()[0].kind }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: `:host { display: block; }`,
})
export class TextInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly label = input('');
  readonly inputType = input('text');
  readonly placeholder = input('');

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.field()().value.set(value);
  }
}
