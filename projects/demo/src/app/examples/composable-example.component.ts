import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required } from '@angular/forms/signals';
import { FieldTree } from '@angular/forms/signals';
import { FkFormComponent, field, group, layout } from 'ngx-formkraft';
import type { LayoutNode } from 'ngx-formkraft';
import { CardGroupComponent } from '../components/card-group.component';

interface Address {
  street: string;
  city: string;
  zip: string;
}

interface OrderForm {
  customerName: string;
  shippingAddress: Address;
  billingAddress: Address;
}

// Reusable layout fragment — works with any Field that has Address shape
function addressFields(addr: FieldTree<Address>): LayoutNode[] {
  return [
    field(addr.street, { type: 'text', props: { label: 'Street' } }),
    field(addr.city, { type: 'text', props: { label: 'City' } }),
    field(addr.zip, { type: 'text', props: { label: 'ZIP Code' } }),
  ];
}

@Component({
  selector: 'app-composable-example',
  standalone: true,
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Composable Layout — Reusable layout fragments</h3>
    <p>The <code>addressFields()</code> function is reused for both shipping and billing addresses.</p>
    <fk-form [form]="orderForm" [layout]="orderLayout" />
    <pre>Value: {{ orderForm().value() | json }}</pre>
  `,
})
export class ComposableExampleComponent {
  private model = signal<OrderForm>({
    customerName: '',
    shippingAddress: { street: '', city: '', zip: '' },
    billingAddress: { street: '', city: '', zip: '' },
  });

  orderForm = form(this.model, (f) => {
    required(f.customerName);
    required(f.shippingAddress.street);
    required(f.billingAddress.street);
  });

  orderLayout = layout(this.orderForm, (f) => [
    field(f.customerName, { type: 'text', props: { label: 'Customer Name' } }),
    group('shipping', { component: CardGroupComponent, props: { title: 'Shipping Address' } }, [
      ...addressFields(f.shippingAddress),
    ]),
    group('billing', { component: CardGroupComponent, props: { title: 'Billing Address' } }, [
      ...addressFields(f.billingAddress),
    ]),
  ]);
}
