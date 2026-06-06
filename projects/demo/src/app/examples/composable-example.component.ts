import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required } from '@angular/forms/signals';
import { FieldTree } from '@angular/forms/signals';
import { FkFormComponent, control, group, layout } from 'ngx-formkraft';
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

function addressFields(addr: FieldTree<Address>): Record<string, LayoutNode> {
  return {
    street: control(addr.street, { type: 'text', props: { label: 'Street' } }),
    city: control(addr.city, { type: 'text', props: { label: 'City' } }),
    zip: control(addr.zip, { type: 'text', props: { label: 'ZIP Code' } }),
  };
}

@Component({
  selector: 'app-composable-example',
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Composable Layout — Reusable layout fragments</h3>
    <p>Layouts are plain functions — composability is free via standard TypeScript.
       The <code>addressFields()</code> function is reused for both shipping and billing
       by passing it directly as the group callback.</p>

    <section class="demo-section">
      <fk-form [form]="orderForm" [layout]="orderLayout" />
      <pre>Value: {{ orderForm().value() | json }}</pre>
    </section>

    <section class="code-section">
      <h4>Reusable layout fragment</h4>
      <pre>{{ codeFragment }}</pre>
      <h4>Compose into layout</h4>
      <pre>{{ codeCompose }}</pre>
      <h4>Other composability patterns</h4>
      <pre>{{ codePatterns }}</pre>
    </section>
  `,
  styles: `
    .demo-section { margin-bottom: 24px; }
    .code-section h4 { margin: 16px 0 8px; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 13px; overflow-x: auto; }
  `,
})
export class ComposableExampleComponent {
  private readonly model = signal<OrderForm>({
    customerName: '',
    shippingAddress: { street: '', city: '', zip: '' },
    billingAddress: { street: '', city: '', zip: '' },
  });

  protected readonly orderForm = form(this.model, (f) => {
    required(f.customerName);
    required(f.shippingAddress.street);
    required(f.billingAddress.street);
  });

  protected readonly orderLayout = layout(this.orderForm, (f) => [
    control(f.customerName, { type: 'text', props: { label: 'Customer Name' } }),
    group(f.shippingAddress, { component: CardGroupComponent, props: { title: 'Shipping Address' } }, addressFields),
    group(f.billingAddress, { component: CardGroupComponent, props: { title: 'Billing Address' } }, addressFields),
  ]);

  protected readonly codeFragment = `function addressFields(addr: FieldTree<Address>): Record<string, LayoutNode> {
  return {
    street: control(addr.street, { type: 'text', props: { label: 'Street' } }),
    city: control(addr.city, { type: 'text', props: { label: 'City' } }),
    zip: control(addr.zip, { type: 'text', props: { label: 'ZIP Code' } }),
  };
}`;

  protected readonly codeCompose = `// Pass the function directly as the group callback
orderLayout = layout(this.orderForm, (f) => [
  control(f.customerName, { type: 'text', props: { label: 'Customer Name' } }),
  group(f.shippingAddress, { component: CardGroupComponent, props: { title: 'Shipping' } }, addressFields),
  group(f.billingAddress, { component: CardGroupComponent, props: { title: 'Billing' } }, addressFields),
]);`;

  protected readonly codePatterns = `// Higher-order builder
function cardGroup(title: string, children: Record<string, LayoutNode>) {
  return group(children, { component: CardGroupComponent, props: { title } });
}

// Extending base layouts
function baseProfile(f: FieldTree<User>): LayoutNode[] {
  return [group({ name: control(f.name), email: control(f.email) })];
}
const hrLayout = layout(form, (f) => [
  ...baseProfile(f),
  cardGroup('HR Info', { department: control(f.department) }),
]);`;
}
