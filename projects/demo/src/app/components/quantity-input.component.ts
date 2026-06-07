import { Component, computed, input } from '@angular/core';
import { FieldTree, FieldState, FormField } from '@angular/forms/signals';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { STOCK } from '../checkout/checkout.form-schema';

/**
 * Plain control (receives `field` + `state`) for a line-item quantity.
 *
 * Reads the field's `STOCK` metadata (catalog stock, attached in the signal-forms schema and
 * derived from the sibling product) to show "N in stock" and flag when the quantity exceeds it.
 * The layout never knows stock exists — this control reads it straight off the field.
 */
@Component({
  selector: 'app-quantity-input',
  imports: [MatFormField, MatLabel, MatHint, MatInput, FormField],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Qty</mat-label>
      <input matInput type="number" [formField]="field()" />
      <mat-hint [class.over]="overStock()">{{ stockHint() }}</mat-hint>
    </mat-form-field>
  `,
  styles: `
    .over {
      color: #d32f2f;
      font-weight: 500;
    }
  `,
})
export class QuantityInputComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly state = input.required<FieldState<number>>();

  protected readonly stock = computed(() => this.state().metadata(STOCK)?.() ?? 0);
  protected readonly overStock = computed(() => (this.state().value() ?? 0) > this.stock());
  protected readonly stockHint = computed(() => {
    const stock = this.stock();
    if (stock <= 0) return 'Out of stock';
    return this.overStock() ? `Only ${stock} in stock` : `${stock} in stock`;
  });
}
