import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-textarea-input',
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput],
  template: `
    <mat-form-field appearance="outline">
      @if (label(); as l) {
        <mat-label>{{ l }}</mat-label>
      }
      <textarea matInput
        [rows]="rows()"
        [placeholder]="placeholder()"
        [value]="field()().value()"
        (input)="onInput($event)"
        (blur)="field()().markAsTouched()">
      </textarea>
    </mat-form-field>
  `,
  styles: `:host { display: block; }`,
})
export class TextareaInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly label = input('');
  readonly placeholder = input('');
  readonly rows = input(4);

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.field()().value.set(value);
  }
}
