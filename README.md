# ngx-formkraft

Auto-rendering forms for Angular Signal Forms.

**ngx-formkraft** is a UI-agnostic library that automatically renders forms from configuration, powered by Angular Signal Forms (`@angular/forms/signals`). It separates form concerns into three layers:

1. **Signal Forms** -- data model + validation (your domain, untouched)
2. **Layout** -- visual structure + rendering instructions (controls, groups, arrays)

[Live Demo](https://fabioemoutinho.github.io/ngx-formkraft)

## Installation

```bash
npm install ngx-formkraft
```

> Requires Angular 21+ with experimental signal forms enabled.

## Quick Start

### 1. Register your control components

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
  name: { type: 'text', props: { label: 'Full Name' } },
  email: { type: 'text', props: { label: 'Email', inputType: 'email' } },
  role: { type: 'select', props: { label: 'Role', options: ['user', 'editor', 'admin'] } },
};
```

That's it. `<fk-form>` walks the form controls, resolves components from the registry, and renders them with the right props.

## Core Concepts

### Two-Layer Architecture

```
Signal Form (data + validation)          Layout (structure + rendering)
form(model, schema)                      layout(form, f => [...])
         \                                        /
          \                                      /
           +------  <fk-form>  ----------------+
                    walks layout tree
                    resolves components
                    renders via NgComponentOutlet
```

### Layout Node Kinds

- **`control`** -- a form control. The component receives the `FieldTree` and uses `[formField]` on its inner form element.
- **`group`** -- renders children inside an optional wrapper component.
- **`array`** -- repeatable section for array fields.

### Component Resolution (two-tier)

Every node (control, group, or array) resolves its component with the same priority:

1. **Direct component reference** (inline in layout) -- highest priority
2. **String `type`** resolved via the registry -- fallback

```typescript
// Direct component -- takes precedence
control(f.bio, { component: RichTextEditor, props: { label: 'Bio' } });

// String type -- resolved from provideFormKraft({ types: { text: TextInput } })
control(f.name, { type: 'text', props: { label: 'Name' } });
```

This applies to groups and arrays too:

```typescript
group('personal', { component: CardComponent }, [...])
group('personal', { type: 'card' }, [...])  // resolved from registry
```

### Visibility

- **Controls**: driven by signal forms' `hidden()` function in the schema. The renderer reads `field().hidden()` automatically.
- **Groups/Arrays**: use `hidden?: Signal<boolean>` on the layout node, since they don't have a corresponding signal form field.

```typescript
// Control visibility -- in signal forms schema
const userForm = form(model, (f) => {
  hidden(f.bio, ({ valueOf }) => valueOf(f.role) !== 'admin');
});

// Group visibility -- in layout
group('admin-section', { hidden: computed(() => userForm.role().value() !== 'admin') }, [...])
```

## API Reference

### Types

#### `LayoutNodeOptions`

Shared rendering options for any layout node.

```typescript
interface LayoutNodeOptions {
  component?: Type<unknown>; // direct component reference
  type?: string; // string type key for registry
  props?: Record<string, unknown>; // inputs passed to component
}
```

#### `FieldDefs<T>`

Map of field keys to their rendering options, matching the form model structure. Used only for auto-layout (when no explicit `layout()` is provided).

```typescript
type FieldDefs<T> = {
  [K in keyof T]?: LayoutNodeOptions | FieldDefs<T[K]>;
};
```

#### `LayoutNode`

Union type: `ControlNode | GroupNode | ArrayNode`

```typescript
interface ControlNode<T> extends LayoutNodeOptions {
  kind: 'control';
  field: FieldTree<T>;
}

interface GroupNode extends LayoutNodeOptions {
  kind: 'group';
  name: string;
  hidden?: Signal<boolean>;
  children: LayoutNode[];
}

interface ArrayNode<T> extends LayoutNodeOptions {
  kind: 'array';
  field: FieldTree<T[]>;
  hidden?: Signal<boolean>;
  itemLayout?: (item: FieldTree<T>, index: number) => LayoutNode[];
}
```

### Builder Functions

#### `control(fieldRef, options?)`

Creates a control node.

```typescript
control(f.name);
control(f.name, { type: 'text', props: { label: 'Name' } });
control(f.name, { component: CustomInput });
```

#### `group(name, children)` / `group(name, options, children)`

Creates a group node with optional wrapper component.

```typescript
group('personal', [control(f.name), control(f.email)]);
group('personal', { type: 'card', props: { title: 'Personal' } }, [control(f.name)]);
group('personal', { component: CardComponent }, [control(f.name)]);
```

#### `array(fieldRef, itemLayout)` / `array(fieldRef, options, itemLayout)`

Creates an array node for repeatable sections.

```typescript
array(f.addresses, (addr, i) => [
  control(addr.street, { type: 'text', props: { label: 'Street' } }),
  control(addr.city, { type: 'text', props: { label: 'City' } }),
])

array(f.addresses, { type: 'repeatable' }, (addr, i) => [...])
```

#### `layout(formRef, fn)`

Creates a reactive layout function. Mirrors `form(model, fn)`.

```typescript
const myLayout = layout(userForm, (f) => [
  group('basics', { type: 'card' }, [
    control(f.name, { type: 'text', props: { label: 'Name' } }),
    control(f.email),
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
});
```

### Components

#### `<fk-form>`

Top-level renderer. Takes form + optional fieldDefs + optional layout.

```html
<!-- With layout -- full control over structure and rendering -->
<fk-form [form]="userForm" [layout]="userLayout" />

<!-- Without layout -- auto-renders from fieldDefs -->
<fk-form [form]="userForm" [fieldDefs]="fieldDefs" />
```

| Input       | Type                 | Description                                     |
| ----------- | -------------------- | ----------------------------------------------- |
| `form`      | `FieldTree<T>`       | Required. The signal form.                      |
| `fieldDefs` | `FieldDefs<T>`       | Optional. Default rendering metadata per field. |
| `layout`    | `() => LayoutNode[]` | Optional. Layout function from `layout()`.      |

#### `<fk-children>`

Helper for custom group components to render their children.

```typescript
@Component({
  template: `
    <mat-card>
      <mat-card-header>{{ title() }}</mat-card-header>
      <mat-card-content>
        <fk-children [children]="children()" [fieldDefs]="fieldDefs()" />
      </mat-card-content>
    </mat-card>
  `,
  imports: [FkChildrenComponent],
})
export class CardGroupComponent {
  name = input.required<string>();
  title = input('');
  children = input.required<Record<string, LayoutNode>>();
  fieldDefs = input<FieldDefs<unknown>>();
}
```

## Component Contracts

### Control Components

The library passes `field` (the `FieldTree`) and `state` (the `FieldState`) as inputs. Control components use `[formField]` on their inner form element -- the `FormField` directive from `@angular/forms/signals` handles value sync, touched, dirty, disabled, required, error state automatically.

**Pattern A: Wrapping existing UI components (Material, PrimeNG, etc.)**

```typescript
@Component({
  imports: [MatFormField, MatInput, MatLabel, MatError, FormField],
  template: `
    <mat-form-field>
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formField]="field()" [placeholder]="placeholder()" />
      <mat-error>{{ state().errors()[0]?.message }}</mat-error>
    </mat-form-field>
  `,
})
export class TextInputComponent {
  field = input.required<FieldTree<string>>(); // always provided by the library
  state = input.required<FieldState<string>>(); // always provided by the library
  label = input(''); // custom prop from props
  placeholder = input(''); // custom prop from props
}
```

**Pattern B: Fully custom controls (implement `FormValueControl<T>`)**

```typescript
export class ColorPickerComponent implements FormValueControl<string> {
  field = input.required<FieldTree<string>>();
  value = model(''); // required -- two-way bound by [formField]
}
```

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
    control(addr.street, { type: 'text', props: { label: 'Street' } }),
    control(addr.city, { type: 'text', props: { label: 'City' } }),
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
  return [group('basics', [control(f.name), control(f.email)])];
}

const hrLayout = layout(userForm, (f) => [
  ...baseProfileLayout(f),
  group('hr', { type: 'card' }, [control(f.department), control(f.startDate)]),
]);
```

## Array Handling

Three patterns for arrays:

| Pattern                                     | When to use                                  |
| ------------------------------------------- | -------------------------------------------- |
| `array(f.items, (item, i) => [...])`        | Library iterates, you define per-item layout |
| `array(f.items, { component: CustomList })` | Your component handles everything            |
| `group('items', { component: Manual }, [])` | You do `@for` yourself, full control         |

## Development

```bash
# Install dependencies
npm install

# Build library
npx ng build ngx-formkraft

# Run demo app
npx ng serve demo

# Run tests
npx ng test ngx-formkraft

# Build demo for deployment
npx ng build demo --base-href /ngx-formkraft/
```

## License

MIT
