import { Component, input } from '@angular/core';
import { FieldTree, FieldState, FormField } from '@angular/forms/signals';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { CATALOG } from '../checkout/catalog';

/**
 * Plain control (receives `field` + `state`) that picks a catalog product by SKU.
 * Binds the SKU as the field value while displaying friendly product names + prices.
 */
@Component({
  selector: 'app-product-picker',
  imports: [MatFormField, MatLabel, MatError, MatSelect, MatOption, FormField],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Product</mat-label>
      <mat-select [formField]="field()">
        @for (p of catalog; track p.sku) {
          <mat-option [value]="p.sku">{{ p.name }} — \${{ p.price }}</mat-option>
        }
      </mat-select>
      <mat-error>{{ state().errors()[0]?.message ?? state().errors()[0]?.kind }}</mat-error>
    </mat-form-field>
  `,
})
export class ProductPickerComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly state = input.required<FieldState<string>>();
  protected readonly catalog = CATALOG;
}
