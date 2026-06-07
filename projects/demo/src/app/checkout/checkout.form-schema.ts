import {
  applyEach,
  createMetadataKey,
  email,
  hidden,
  max,
  metadata,
  required,
  schema,
} from '@angular/forms/signals';
import { productOf } from './catalog';
import { CheckoutModel } from './checkout.model';

/**
 * Field metadata key carrying the catalog stock for a line item's quantity field.
 * It's reference data that travels WITH the field but isn't part of the form value —
 * read by the QuantityInput control to show "N in stock".
 */
export const STOCK = createMetadataKey<number>();

/**
 * The Signal Forms schema — the model's validation, metadata and conditional visibility,
 * passed to `form(model, schema)`. This layer knows nothing about layout or rendering.
 */
export const checkoutFormSchema = schema<CheckoutModel>((f) => {
  required(f.customerName);
  required(f.email);
  email(f.email);

  // Billing address only applies when it differs from shipping.
  hidden(f.billing, { when: ({ valueOf }) => valueOf(f.billingSameAsShipping) });
  // Company is only collected on the business (Pro) plan.
  hidden(f.company, { when: ({ valueOf }) => valueOf(f.plan) !== 'Pro' });

  applyEach(f.items, (item) => {
    required(item.sku);
    // Stock of the chosen product, surfaced as field metadata (derived from the sibling sku).
    metadata(item.quantity, STOCK, ({ valueOf }) => productOf(valueOf(item.sku))?.stock ?? 0);
    // Quantity may not exceed available stock.
    max(item.quantity, ({ valueOf }) => productOf(valueOf(item.sku))?.stock ?? 0, {
      message: ({ valueOf }) => `Only ${productOf(valueOf(item.sku))?.stock ?? 0} in stock`,
    });
  });
});
