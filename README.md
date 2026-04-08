# ngx-formkraft

Auto-rendering forms for Angular Signal Forms.

**ngx-formkraft** is a UI-agnostic library that automatically renders forms from configuration, powered by Angular Signal Forms (`@angular/forms/signals`). It separates form concerns into three layers:

1. **Signal Forms** -- data model + validation (your domain, untouched)
2. **Field Metadata** -- rendering instructions (which component, what props)
3. **Layout** -- visual structure (groups, ordering, composition)

[Live Demo](https://fabioemoutinho.github.io/ngx-formkraft)

## Installation

```bash
npm install ngx-formkraft
```

> Requires Angular 21+ with experimental signal forms enabled.

## Quick Start

### 1. Register your field components

```typescript
// app.config.ts
import { provideFormKraft } from 'ngx-formkraft';
import { TextInputComponent } from './components/text-input.component';
import { SelectComponent } from './components/select.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFormKraft({
      types: {
        text: TextInputComponent,
        select: SelectComponent,
        // groups and arrays can also be registered
        card: CardGroupComponent,
      },
    }),
  ],
};
```

### 2. Define your form (signal forms)

```typescript
import { signal } from '@angular/core';
import { form, required, email } from '@angular/forms/signals';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

const model = signal<UserProfile>({ name: '', email: '', role: 'user' });

const userForm = form(model, (f) => {
  required(f.name);
  email(f.email);
});
```

### 3. Render it

```html
<fk-form [form]="userForm" [fieldDefs]="fieldDefs" />
```

```typescript
import type { FieldDefs } from 'ngx-formkraft';

const fieldDefs: FieldDefs<UserProfile> = {
  name:  { type: 'text', props: { label: 'Full Name' } },
  email: { type: 'text', props: { label: 'Email', inputType: 'email' } },
  role:  { type: 'select', props: { label: 'Role', options: ['user', 'editor', 'admin'] } },
};
```

That's it. `<fk-form>` walks the form fields, resolves components from the registry, and renders them with the right props.

## Core Concepts

### Three-Layer Architecture

```
Signal Form (data + validation)     Field Metadata (rendering)     Layout (structure)
form(model, schema)                 { component, type, props }     layout(form, f => [...])
         \                                   |                          /
          \                                  |                         /
           +-----------  <fk-form>  --------------------------------+
                         walks layout tree
                         resolves components
                         creates via ViewContainerRef.createComponent + Binding[]
```

### Component Resolution (two-tier)

Every node (field, group, or array) resolves its component with the same priority:

1. **Direct component reference** (inline in layout or field def) -- highest priority
2. **String `type`** resolved via the registry -- fallback

```typescript
// Direct component -- takes precedence
field(f.bio, { component: RichTextEditor, props: { label: 'Bio' } })

// String type -- resolved from provideFormKraft({ types: { text: TextInput } })
field(f.name, { type: 'text', props: { label: 'Name' } })
```

This applies to groups and arrays too:

```typescript
group('personal', { component: CardComponent }, [...])
group('personal', { type: 'card' }, [...])  // resolved from registry
```

### Visibility

- **Fields**: driven by signal forms' `hidden()` function in the schema. The renderer reads `field().hidden()` automatically.
- **Groups/Arrays**: use `hidden?: Signal<boolean>` on the layout node, since they don't have a corresponding signal form field.

```typescript
// Field visibility -- in signal forms schema
const userForm = form(model, (f) => {
  hidden(f.bio, ({ value }) => value() !== 'admin');
});

// Group visibility -- in layout
group('admin-section', { hidden: computed(() => userForm.role().value() !== 'admin') }, [...])
```

## API Reference

### Types

#### `FieldDef<T>`

Rendering instruction for a single field.

```typescript
interface FieldDef<TValue = unknown> {
  component?: Type<unknown>;  // direct component reference
  type?: string;              // string type key for registry
  props?: Record<string, unknown | (() => unknown)>;  // inputs passed to component
}
```

#### `FieldDefs<T>`

Map of field keys to their rendering definitions, matching the form model structure.

```typescript
type FieldDefs<T> = {
  [K in keyof T]?: FieldDef<T[K]> | FieldDefs<T[K]>;
};
```

#### `LayoutNode`

Union type: `FieldNode | GroupNode | ArrayNode`

```typescript
interface FieldNode<T> {
  kind: 'field';
  field: FieldTree<T>;
  def?: FieldDef<T>;
  component?: Type<unknown>;
  type?: string;
  props?: Record<string, unknown>;
}

interface GroupNode {
  kind: 'group';
  name: string;
  hidden?: Signal<boolean>;
  children: LayoutNode[];
  component?: Type<unknown>;
  type?: string;
  props?: Record<string, unknown>;
}

interface ArrayNode<T> {
  kind: 'array';
  field: FieldTree<T[]>;
  hidden?: Signal<boolean>;
  itemLayout?: (item: FieldTree<T>, index: number) => LayoutNode[];
  component?: Type<unknown>;
  type?: string;
  props?: Record<string, unknown>;
}
```

### Builder Functions

#### `field(fieldRef, def?)`

Creates a field node.

```typescript
field(f.name)
field(f.name, { type: 'text', props: { label: 'Name' } })
field(f.name, { component: CustomInput })
```

#### `group(name, children)` / `group(name, options, children)`

Creates a group node with optional wrapper component.

```typescript
group('personal', [field(f.name), field(f.email)])
group('personal', { type: 'card', props: { title: 'Personal' } }, [field(f.name)])
group('personal', { component: CardComponent }, [field(f.name)])
```

#### `array(fieldRef, itemLayout)` / `array(fieldRef, options, itemLayout)`

Creates an array node for repeatable sections.

```typescript
array(f.addresses, (addr, i) => [
  field(addr.street, { type: 'text', props: { label: 'Street' } }),
  field(addr.city, { type: 'text', props: { label: 'City' } }),
])

array(f.addresses, { type: 'repeatable' }, (addr, i) => [...])
```

#### `layout(formRef, fn)`

Creates a reactive layout function. Mirrors `form(model, fn)`.

```typescript
const myLayout = layout(userForm, (f) => [
  group('basics', { type: 'card' }, [
    field(f.name, { type: 'text', props: { label: 'Name' } }),
    field(f.email),
  ]),
]);
```

### Provider

#### `provideFormKraft(config)`

Registers the type registry at the environment level.

```typescript
provideFormKraft({
  types: {
    text: TextInputComponent,
    select: SelectInputComponent,
    card: CardGroupComponent,
    repeatable: RepeatableSectionComponent,
  },
})
```

### Components

#### `<fk-form>`

Top-level renderer. Takes form + optional fieldDefs + optional layout.

```html
<!-- With layout -->
<fk-form [form]="userForm" [fieldDefs]="fieldDefs" [layout]="userLayout" />

<!-- Without layout -- auto-renders from fieldDefs -->
<fk-form [form]="userForm" [fieldDefs]="fieldDefs" />
```

| Input | Type | Description |
|-------|------|-------------|
| `form` | `FieldTree<T>` | Required. The signal form. |
| `fieldDefs` | `FieldDefs<T>` | Optional. Default rendering metadata per field. |
| `layout` | `() => LayoutNode[]` | Optional. Layout function from `layout()`. |

#### `<fk-render-children>`

Helper for custom group components to render their children.

```typescript
@Component({
  template: `
    <mat-card>
      <mat-card-header>{{ title() }}</mat-card-header>
      <mat-card-content>
        <fk-render-children [children]="children()" [fieldDefs]="fieldDefs()" />
      </mat-card-content>
    </mat-card>
  `,
  imports: [FkRenderChildrenComponent],
})
export class CardGroupComponent {
  name = input.required<string>();
  title = input('');
  children = input.required<LayoutNode[]>();
  fieldDefs = input<FieldDefs<unknown>>();
}
```

## Component Contracts

### Field Components

No base class required. Just declare the inputs:

```typescript
@Component({ ... })
export class TextInputComponent {
  field = input.required<FieldTree<string>>();  // always provided by the library
  label = input('');
  placeholder = input('');
}
```

The library passes `field` automatically and spreads `props` as additional input bindings.

### Group Components

Receive `name`, `children`, `fieldDefs`, and custom props:

```typescript
@Component({ ... })
export class CardGroupComponent {
  name = input.required<string>();
  children = input.required<LayoutNode[]>();
  fieldDefs = input<FieldDefs<unknown>>();
  title = input('');  // custom prop from props
}
```

### Array Components

Receive the array `field` and custom props:

```typescript
@Component({ ... })
export class RepeatableComponent {
  field = input.required<FieldTree<any[]>>();
}
```

## Layout Composability

Layouts are plain functions returning `LayoutNode[]` -- composability is free via standard TypeScript patterns.

### Reusable Fragments

```typescript
function addressFields(addr: FieldTree<Address>): LayoutNode[] {
  return [
    field(addr.street, { type: 'text', props: { label: 'Street' } }),
    field(addr.city, { type: 'text', props: { label: 'City' } }),
  ];
}

const orderLayout = layout(orderForm, (f) => [
  group('shipping', { type: 'card', props: { title: 'Shipping' } }, [
    ...addressFields(f.shippingAddress),
  ]),
  group('billing', { type: 'card', props: { title: 'Billing' } }, [
    ...addressFields(f.billingAddress),
  ]),
]);
```

### Higher-Order Builders

```typescript
function cardSection(name: string, title: string, nodes: LayoutNode[]) {
  return group(name, { type: 'card', props: { title } }, nodes);
}
```

### Extending Layouts

```typescript
function baseProfileLayout(f: FieldTree<UserProfile>): LayoutNode[] {
  return [group('basics', [field(f.name), field(f.email)])];
}

const hrLayout = layout(userForm, (f) => [
  ...baseProfileLayout(f),
  group('hr', { type: 'card' }, [field(f.department), field(f.startDate)]),
]);
```

## Array Handling

Three patterns for arrays:

| Pattern | When to use |
|---------|-------------|
| `array(f.items, (item, i) => [...])` | Library iterates, you define per-item layout |
| `array(f.items, { component: CustomList })` | Your component handles everything |
| `group('items', { component: Manual }, [])` | You do `@for` yourself, full control |

## Development

```bash
# Install dependencies
npm install

# Build library
npx ng build ngx-formkraft

# Run demo app
npx ng serve demo

# Build demo for deployment
npx ng build demo --base-href /ngx-formkraft/
```

## License

MIT
