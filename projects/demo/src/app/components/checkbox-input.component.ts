import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';

/** Plain control for a boolean toggle — binds via `[formField]`, so it only needs `field`. */
@Component({
  selector: 'app-checkbox-input',
  imports: [MatCheckbox, FormField],
  template: `<mat-checkbox [formField]="field()">{{ label() }}</mat-checkbox>`,
})
export class CheckboxInputComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly label = input('');
}
