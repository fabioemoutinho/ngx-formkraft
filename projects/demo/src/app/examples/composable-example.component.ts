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
    <p>Layouts are plain functions returning <code>LayoutNode[]</code> — composability is free via standard TypeScript.
       The <code>addressFields()</code> function is reused for both shipping and billing.</p>

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
    group('shipping', { component: CardGroupComponent, props: { title: 'Shipping Address' } },
      addressFields(f.shippingAddress),
    ),
    group('billing', { component: CardGroupComponent, props: { title: 'Billing Address' } },
      addressFields(f.billingAddress),
    ),
  ]);

  protected readonly codeFragment = `function addressFields(addr: FieldTree<Address>): LayoutNode[] {
  return [
    control(addr.street, { type: 'text', props: { label: 'Street' } }),
    control(addr.city, { type: 'text', props: { label: 'City' } }),
    control(addr.zip, { type: 'text', props: { label: 'ZIP Code' } }),
  ];
}`;

  protected readonly codeCompose = `orderLayout = layout(this.orderForm, (f) => [
  control(f.customerName, { type: 'text', props: { label: 'Customer Name' } }),
  group('shipping', { type: 'card', props: { title: 'Shipping' } }, [
    ...addressFields(f.shippingAddress),
  ]),
  group('billing', { type: 'card', props: { title: 'Billing' } }, [
    ...addressFields(f.billingAddress),
  ]),
]);`;

  protected readonly codePatterns = `// Higher-order builder
function cardSection(name: string, title: string, nodes: LayoutNode[]) {
  return group(name, { type: 'card', props: { title } }, nodes);
}

// Extending base layouts
function baseProfile(f: FieldTree<User>): LayoutNode[] {
  return [group('basics', [control(f.name), control(f.email)])];
}
const hrLayout = layout(form, f => [
  ...baseProfile(f),
  cardSection('hr', 'HR Info', [control(f.department)]),
]);`;
}
