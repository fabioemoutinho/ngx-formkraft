---
name: ngx-formkraft
description: Use this skill when working with ngx-formkraft — an Angular library for auto-rendering forms using Signal Forms. Trigger when code imports from 'ngx-formkraft', uses FkFormComponent, control(), group(), array(), layout(), or provideFormKraft().
---

# ngx-formkraft — Signal Forms Auto-Renderer

## What it is

ngx-formkraft auto-renders Angular forms from configuration, powered by Angular Signal Forms (`@angular/forms/signals`). Three layers:

1. **Signal Forms** — data model + validation (`form()`, `required()`, `hidden()`, etc.)
2. **Layout** — visual structure + rendering instructions: controls, groups, arrays

## Layout Node Kinds

- **`control`** — renders a form control. The component implements `FormValueControl<T>`. The renderer attaches `[formField]` automatically, binding value, errors, touched, disabled, etc.
- **`group`** — renders children inside an optional wrapper component
- **`array`** — repeatable section for array fields

## Key APIs

### Provider (app.config.ts)

```typescript
import { provideFormKraft } from 'ngx-formkraft';

provideFormKraft({
  types: {
    text: TextInputComponent,
    select: SelectComponent,
    card: CardGroupComponent,       // groups can use registry too
    repeatable: RepeatableComponent, // arrays can use registry too
  },
})
```

### Builder Functions

```typescript
import { layout, control, group, array } from 'ngx-formkraft';

// control(fieldRef, options?) — renders a form control
control(f.name, { type: 'text', props: { label: 'Name' } })
control(f.bio, { component: RichTextEditor })

// group(name, children) or group(name, options, children)
group('personal', [control(f.name)])
group('personal', { type: 'card', props: { title: 'Info' } }, [control(f.name)])
group('section', { hidden: computed(() => someSignal()) }, [control(f.x)])

// array(fieldRef, itemLayout) or array(fieldRef, options, itemLayout)
array(f.addresses, (addr, i) => [control(addr.street), control(addr.city)])

// layout(formRef, fn) — returns () => LayoutNode[]
const myLayout = layout(myForm, f => [
  group('basics', [control(f.name), control(f.email)]),
]);
```

### Template Usage

```html
<!-- With explicit layout -->
<fk-form [form]="myForm" [fieldDefs]="fieldDefs" [layout]="myLayout" />

<!-- Auto-render from fieldDefs (no layout needed) -->
<fk-form [form]="myForm" [fieldDefs]="fieldDefs" />
```

### Component Resolution

1. `node.component` (direct component reference) — highest priority
2. `node.type` resolved via registry — fallback

This applies to controls, groups, AND arrays. All options go directly on the node — there is no separate `def` layer.

### Control Component Contract

Two patterns:

**Pattern A: Wrapping existing UI components** — receive `field` and `state` inputs, use `[formField]` on the inner form element:

```typescript
@Component({
  imports: [MatFormField, MatInput, FormField],
  template: `
    <mat-form-field>
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formField]="field()" />
      <mat-error>{{ state().errors()[0]?.message }}</mat-error>
    </mat-form-field>
  `,
})
export class TextInputComponent {
  readonly field = input.required<FieldTree<string>>();   // provided by the library
  readonly state = input.required<FieldState<string>>();  // provided by the library
  readonly label = input('');       // custom prop
}
```

**Pattern B: Fully custom controls** — implement `FormValueControl<T>`, only `value = model()` is required:

```typescript
export class RatingComponent implements FormValueControl<number> {
  readonly field = input.required<FieldTree<number>>();
  readonly value = model(0);          // required — two-way bound
  readonly errors = input([]);         // optional — auto-bound
  readonly disabled = input(false);    // optional — auto-bound
  readonly touched = model(false);     // optional — auto-bound
}
```

### Group Component Contract

```typescript
@Component({
  template: `
    <my-wrapper>
      <fk-children [children]="children()" [fieldDefs]="fieldDefs()" />
    </my-wrapper>
  `,
  imports: [FkChildrenComponent],
})
export class MyGroupComponent {
  readonly name = input.required<string>();
  readonly children = input.required<Record<string, LayoutNode>>();
  readonly fieldDefs = input<FieldDefs<unknown>>();
  readonly title = input(''); // custom prop
}
```

### Visibility

- **Controls**: Use signal forms `hidden()` in the schema. The renderer reads `field().hidden()` automatically.
- **Groups/Arrays**: Use `hidden?: Signal<boolean>` on the layout node.

### Layout Composability

Layouts are plain functions — composability is free:

```typescript
function addressFields(addr: FieldTree<Address>): LayoutNode[] {
  return [
    control(addr.street, { type: 'text', props: { label: 'Street' } }),
    control(addr.city, { type: 'text', props: { label: 'City' } }),
  ];
}

layout(orderForm, f => [
  group('shipping', { type: 'card' }, [...addressFields(f.shippingAddress)]),
  group('billing', { type: 'card' }, [...addressFields(f.billingAddress)]),
]);
```

## Important Notes

- `FieldTree<T>` (not `Field<T>`) is the correct type from `@angular/forms/signals` in Angular 21+
- Wrapper controls (Pattern A) use `[formField]` on their inner form element — the library passes `field` and `state` as inputs
- Custom controls (Pattern B) implement `FormValueControl<T>` — only `value = model()` is required
- For Pattern B, `value` must be a `model()` (ModelSignal), not `input()` — it's two-way bound
- Use `protected readonly` for template-bound members, `private readonly` for internal state
- The library is UI-agnostic — bring your own components (Material, PrimeNG, custom, etc.)
- Requires Angular 21+ with experimental signal forms
