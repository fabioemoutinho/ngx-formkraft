# ngx-signal-forms-renderer

Auto-rendering forms for Angular Signal Forms.

**ngx-signal-forms-renderer** is a UI-agnostic library that renders forms from a layout description, powered by Angular Signal Forms (`@angular/forms/signals`). It separates form concerns into two layers:

1. **Signal Forms** — data model + validation (your domain, untouched)
2. **Layout** — visual structure + rendering instructions (controls, groups, arrays)

[Live Demo](https://fabioemoutinho.github.io/ngx-signal-forms-renderer)

## Installation

```bash
npm install ngx-signal-forms-renderer
```

> Requires Angular 21+ with experimental signal forms enabled.

## Quick Start

### 1. Register your control components

```typescript
// app.config.ts
import { provideSignalFormsRenderer } from 'ngx-signal-forms-renderer';
import { TextInputComponent } from './components/text-input.component';
import { SelectComponent } from './components/select.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSignalFormsRenderer({
      types: {
        text: TextInputComponent,
        select: SelectComponent,
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

### 3. Describe the layout

```typescript
import { layout, control, group } from 'ngx-signal-forms-renderer';

const userLayout = layout(userForm, (f) => [
  group('personal', { type: 'card', props: { title: 'Personal Info' } }, {
    name: control(f.name, { type: 'text', props: { label: 'Full Name' } }),
    email: control(f.email, { type: 'text', props: { label: 'Email', inputType: 'email' } }),
    role: control(f.role, { type: 'select', props: { label: 'Role', options: ['user', 'editor', 'admin'] } }),
  }),
]);
```

### 4. Render it

```html
<sfr-form [form]="userForm" [layout]="userLayout" />
```

## Core Concepts

### Two-Layer Architecture

```
Signal Form (data + validation)          Layout (structure + rendering)
form(model, schema)                      layout(form, f => [...])
         \                                        /
          \                                      /
           +------  <sfr-form>  ----------------+
                    walks layout tree
                    resolves components
                    renders via NgComponentOutlet
```

### Layout Node Kinds

- **`control`** — a form control. The component receives `field` and `state` and uses `[formField]` on its inner form element.
- **`group`** — a keyed collection of nodes rendered inside an optional wrapper component. Children are a `Record<string, LayoutNode>`.
- **`array`** — an ordered sequence of nodes rendered inside an optional wrapper component. Children are `LayoutNode[]`.

### Component Resolution (two-tier)

Every node (control, group, or array) resolves its component with the same priority:

1. **Direct component reference** (inline in layout) — highest priority
2. **String `type`** resolved via the registry — fallback

```typescript
// Direct component — takes precedence
control(f.bio, { component: RichTextEditor, props: { label: 'Bio' } });

// String type — resolved from provideSignalFormsRenderer({ types: { text: TextInput } })
control(f.name, { type: 'text', props: { label: 'Name' } });
```

This applies to groups and arrays too:

```typescript
group('personal', { component: CardComponent }, { name: control(f.name) })
group('personal', { type: 'card' }, { name: control(f.name) })  // resolved from registry
```

### Visibility

- **Controls**: driven by signal forms' `hidden()` function in the schema. The renderer reads `field().hidden()` automatically.
- **Groups/Arrays**: use `hidden?: Signal<boolean>` on the layout node, since they don't have a corresponding signal form field.

```typescript
// Control visibility — in signal forms schema
const userForm = form(model, (f) => {
  hidden(f.bio, ({ valueOf }) => valueOf(f.role) !== 'admin');
});

// Group visibility — in layout
group('admin-section', { hidden: computed(() => userForm.role().value() !== 'admin') }, {})
```

## API Reference

### Types

#### `LayoutNodeOptions`

Shared rendering options for any layout node.

```typescript
interface LayoutNodeOptions {
  component?: Type<unknown>; // direct component reference
  type?: string;             // string type key for registry
  props?: Record<string, unknown>; // inputs passed to component
}
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
  children: Record<string, LayoutNode>;
}

interface ArrayNode extends LayoutNodeOptions {
  kind: 'array';
  name: string;
  hidden?: Signal<boolean>;
  children: LayoutNode[];
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

Creates a group node (keyed collection) with optional wrapper component.

```typescript
group('personal', { name: control(f.name), email: control(f.email) });
group('personal', { type: 'card', props: { title: 'Personal' } }, { name: control(f.name) });
group('personal', { component: CardComponent }, { name: control(f.name) });
```

#### `array(name, children)` / `array(name, options, children)`

Creates an array node (ordered sequence) with optional wrapper component.

```typescript
array('steps', [control(f.step1), control(f.step2)]);
array('steps', { component: StepperComponent }, [control(f.step1), control(f.step2)]);
array('steps', { type: 'stepper' }, [control(f.step1)]);
```

#### `layout(formRef, fn)`

Creates a reactive layout function. Mirrors `form(model, fn)`.

```typescript
const myLayout = layout(userForm, (f) => [
  group('basics', { type: 'card' }, {
    name: control(f.name, { type: 'text', props: { label: 'Name' } }),
    email: control(f.email),
  }),
]);
```

### Provider

#### `provideSignalFormsRenderer(config)`

Registers the type registry at the environment level.

```typescript
provideSignalFormsRenderer({
  types: {
    text: TextInputComponent,
    select: SelectInputComponent,
    card: CardGroupComponent,
    stepper: StepperComponent,
  },
});
```

### Components

#### `<sfr-form>`

Top-level renderer. Takes a form and a layout function.

```html
<sfr-form [form]="userForm" [layout]="userLayout" />
```

| Input    | Type                 | Description                             |
| -------- | -------------------- | --------------------------------------- |
| `form`   | `FieldTree<T>`       | Required. The signal form.              |
| `layout` | `() => LayoutNode[]` | Required. Layout function from `layout()`. |

#### `<sfr-children>`

Helper for custom group and array components to render their children.

```typescript
@Component({
  template: `
    <mat-card>
      <mat-card-header>{{ title() }}</mat-card-header>
      <mat-card-content>
        <sfr-children [children]="children()" />
      </mat-card-content>
    </mat-card>
  `,
  imports: [SfrChildrenComponent],
})
export class CardGroupComponent {
  name = input.required<string>();
  title = input('');
  children = input.required<Record<string, LayoutNode>>();
}
```

## Component Contracts

### Control Components

The library passes `field` (the `FieldTree`) and `state` (the `FieldState`) as inputs. Control components use `[formField]` on their inner form element — the `FormField` directive from `@angular/forms/signals` handles value sync, touched, dirty, disabled, required, error state automatically.

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
  value = model(''); // required — two-way bound by [formField]
}
```

### Group Components

Receive `name`, `children` (as `Record<string, LayoutNode>`), and any custom props:

```typescript
@Component({ ... })
export class CardGroupComponent {
  name = input.required<string>();
  children = input.required<Record<string, LayoutNode>>();
  title = input(''); // custom prop from props
}
```

Use `<sfr-children [children]="children()" />` to render them, or iterate `children()` by key for custom placement.

### Array Components

Receive `name`, `children` (as `LayoutNode[]`), and any custom props:

```typescript
@Component({ ... })
export class StepperComponent {
  name = input.required<string>();
  children = input.required<LayoutNode[]>();
}
```

Use `<sfr-children [children]="children()" />` to render them in order, or iterate manually for full control.

## Layout Composability

Layouts are plain functions returning `LayoutNode[]` — composability is free via standard TypeScript patterns.

### Reusable Fragments

```typescript
function addressFields(addr: FieldTree<Address>): Record<string, LayoutNode> {
  return {
    street: control(addr.street, { type: 'text', props: { label: 'Street' } }),
    city: control(addr.city, { type: 'text', props: { label: 'City' } }),
  };
}

const orderLayout = layout(orderForm, (f) => [
  group('shipping', { type: 'card', props: { title: 'Shipping' } }, addressFields(f.shippingAddress)),
  group('billing', { type: 'card', props: { title: 'Billing' } }, addressFields(f.billingAddress)),
]);
```

### Higher-Order Builders

```typescript
function cardGroup(name: string, title: string, children: Record<string, LayoutNode>) {
  return group(name, { type: 'card', props: { title } }, children);
}
```

### Extending Layouts

```typescript
function baseProfileLayout(f: FieldTree<UserProfile>): LayoutNode[] {
  return [group('basics', { name: control(f.name), email: control(f.email) })];
}

const hrLayout = layout(userForm, (f) => [
  ...baseProfileLayout(f),
  group('hr', { type: 'card' }, { department: control(f.department), startDate: control(f.startDate) }),
]);
```

## Development

```bash
# Install dependencies
npm install

# Build library
npx ng build ngx-signal-forms-renderer

# Run demo app
npx ng serve demo

# Run tests
npx ng test ngx-signal-forms-renderer

# Build demo for deployment
npx ng build demo --base-href /ngx-signal-forms-renderer/
```

## License

MIT
