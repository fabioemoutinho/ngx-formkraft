import { computed, inputBinding } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { control, group, array, LayoutNode } from 'ngx-signal-forms-renderer';
import { CardGroupComponent } from '../components/card-group.component';
import { SortableListComponent } from '../components/sortable-list.component';
import { ProductPickerComponent } from '../components/product-picker.component';
import { QuantityInputComponent } from '../components/quantity-input.component';
import { RatingInputComponent } from '../components/rating-input.component';
import { StackComponent } from '../components/stack.component';
import { CheckoutModel, LineItem } from './checkout.model';

// ── Plain-data schema ────────────────────────────────────────────────────────
// This is just data — it could come from a server. The adapter below turns it into
// a renderer layout. Nothing here imports Angular.

export interface FieldConfig {
  kind: 'field';
  name: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox' | 'rating';
  label?: string;
  placeholder?: string;
  inputType?: string;
  options?: string[];
}

export interface SectionConfig {
  kind: 'section';
  title: string;
  fields: FieldConfig[];
  /**
   * If this section maps to a nested object in the model, its key (e.g. 'shipping'). The section
   * is then bound to that sub-object field — its `fields` resolve under it, and it defers to the
   * field's native hidden(). Omit for sections that group top-level fields.
   */
  field?: string;
  /** Layout-level visibility predicate, e.g. 'plan=Pro' or '!billingSameAsShipping'. */
  when?: string;
}

export interface ArrayConfig {
  kind: 'array';
  name: string;
  reorderable?: boolean;
}

export type NodeConfig = SectionConfig | FieldConfig | ArrayConfig;
export type FormSchema = NodeConfig[];

export const checkoutSchema: FormSchema = [
  {
    kind: 'section',
    title: 'Customer',
    fields: [
      { kind: 'field', name: 'customerName', type: 'text', label: 'Full name' },
      { kind: 'field', name: 'email', type: 'text', label: 'Email', inputType: 'email' },
    ],
  },
  {
    kind: 'section',
    title: 'Shipping address',
    field: 'shipping',
    fields: [
      { kind: 'field', name: 'street', type: 'text', label: 'Street' },
      { kind: 'field', name: 'city', type: 'text', label: 'City' },
      { kind: 'field', name: 'zip', type: 'text', label: 'ZIP' },
    ],
  },
  {
    kind: 'field',
    name: 'billingSameAsShipping',
    type: 'checkbox',
    label: 'Billing address same as shipping',
  },
  {
    kind: 'section',
    title: 'Billing address',
    field: 'billing',
    fields: [
      { kind: 'field', name: 'street', type: 'text', label: 'Street' },
      { kind: 'field', name: 'city', type: 'text', label: 'City' },
      { kind: 'field', name: 'zip', type: 'text', label: 'ZIP' },
    ],
  },
  { kind: 'array', name: 'items', reorderable: true },
  {
    kind: 'section',
    title: 'Plan',
    fields: [
      { kind: 'field', name: 'plan', type: 'select', label: 'Plan', options: ['Free', 'Pro'] },
    ],
  },
  {
    kind: 'section',
    title: 'Business details',
    when: 'plan=Pro',
    fields: [{ kind: 'field', name: 'company', type: 'text', label: 'Company name' }],
  },
  {
    kind: 'section',
    title: 'Feedback',
    fields: [{ kind: 'field', name: 'rating', type: 'rating', label: 'How was your experience?' }],
  },
];

// ── Adapter: schema → renderer layout ────────────────────────────────────────

export interface AdapterCallbacks {
  moveItem: (from: number, to: number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
}

/** Turn the plain-data schema into a renderer layout for the given form. */
export function buildCheckoutLayout(
  f: FieldTree<CheckoutModel>,
  cb: AdapterCallbacks,
): LayoutNode[] {
  const sections = checkoutSchema.map((node) => buildNode(node, f, cb));
  return [array(sections, { component: StackComponent })];
}

function buildNode(
  node: NodeConfig,
  f: FieldTree<CheckoutModel>,
  cb: AdapterCallbacks,
): LayoutNode {
  switch (node.kind) {
    case 'field':
      return fieldControl(node, child(f, node.name));
    case 'array':
      return array(
        child(f, node.name) as FieldTree<LineItem[]>,
        {
          component: SortableListComponent,
          bindings: [
            inputBinding('onMove', () => cb.moveItem),
            inputBinding('onAdd', () => cb.addItem),
            inputBinding('onRemove', () => cb.removeItem),
          ],
        },
        lineItemLayout,
      );
    case 'section':
      return sectionGroup(node, f);
  }
}

function sectionGroup(node: SectionConfig, f: FieldTree<CheckoutModel>): LayoutNode {
  const titleBinding = inputBinding('title', () => node.title);
  if (node.field) {
    // Data-driven group bound to a sub-object field; native hidden() applies automatically.
    return group(
      child(f, node.field),
      { component: CardGroupComponent, bindings: [titleBinding] },
      (g) => fieldsRecord(node.fields, g),
    );
  }
  const hidden = node.when ? computed(() => !matches(node.when!, f().value())) : undefined;
  return group(fieldsRecord(node.fields, f), {
    component: CardGroupComponent,
    bindings: [titleBinding],
    hidden,
  });
}

function fieldsRecord(fields: FieldConfig[], node: FieldTree<unknown>): Record<string, LayoutNode> {
  const record: Record<string, LayoutNode> = {};
  for (const fc of fields) record[fc.name] = fieldControl(fc, child(node, fc.name));
  return record;
}

function fieldControl(fc: FieldConfig, field: FieldTree<unknown>): LayoutNode {
  const bindings = [];
  if (fc.label != null) bindings.push(inputBinding('label', () => fc.label));
  if (fc.placeholder != null) bindings.push(inputBinding('placeholder', () => fc.placeholder));
  if (fc.inputType != null) bindings.push(inputBinding('inputType', () => fc.inputType));
  if (fc.options != null) bindings.push(inputBinding('options', () => fc.options));
  const resolved = fc.type === 'rating' ? { component: RatingInputComponent } : { type: fc.type };
  return control(field, { ...resolved, bindings });
}

function lineItemLayout(item: FieldTree<LineItem>): LayoutNode {
  return group(
    item,
    { component: CardGroupComponent, bindings: [inputBinding('title', () => 'Item')] },
    (g) => ({
      sku: control(g.sku, { component: ProductPickerComponent }),
      quantity: control(g.quantity, { component: QuantityInputComponent }),
    }),
  );
}

/** Index a field tree node by string key (the schema is dynamic, so keys aren't statically known). */
function child(node: FieldTree<unknown>, key: string): FieldTree<unknown> {
  return (node as unknown as Record<string, FieldTree<unknown>>)[key];
}

/** Tiny predicate evaluator for section `when` strings: 'field=value', '!field', or 'field'. */
function matches(expr: string, value: CheckoutModel): boolean {
  const v = value as unknown as Record<string, unknown>;
  if (expr.includes('=')) {
    const [key, expected] = expr.split('=');
    return String(v[key]) === expected;
  }
  if (expr.startsWith('!')) return !v[expr.slice(1)];
  return !!v[expr];
}
