import {
  Binding,
  Component,
  computed,
  DirectiveWithBindings,
  effect,
  forwardRef,
  inject,
  input,
  inputBinding,
  isSignal,
  Signal,
  Type,
} from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { LayoutNode } from './layout-types';
import { SIGNAL_FORMS_RENDERER_TYPE_REGISTRY } from './provider';
import { SfrComponentOutletDirective } from './sfr-component-outlet.directive';

/**
 * Recursive layout node renderer. Receives a LayoutNode and renders the resolved
 * component via `*sfrComponentOutlet`, passing reactive signal bindings (and, for
 * control nodes, the `FormField` host directive). When no component is resolved it
 * falls back to rendering the node's children, each through a nested `sfr-node`.
 *
 * For control nodes whose component implements `FormValueControl<T>`, the `FormField`
 * directive is attached so value, errors, touched, disabled, etc. are bound
 * automatically from the field. Other control components receive `field` and `state`
 * inputs instead.
 */
@Component({
  selector: 'sfr-node',
  imports: [SfrComponentOutletDirective, forwardRef(() => SfrNodeComponent)],
  template: `
    @if (!isHidden()) {
      @if (resolvedComponent(); as comp) {
        <ng-container *sfrComponentOutlet="comp; directives: directives(); bindings: bindings()" />
      } @else {
        @for (child of children(); track child) {
          <sfr-node [node]="child" />
        }
      }
    }
  `,
})
export class SfrNodeComponent {
  readonly node = input.required<LayoutNode>();

  private readonly registry = inject(SIGNAL_FORMS_RENDERER_TYPE_REGISTRY);

  protected readonly isHidden = computed(() => {
    const node = this.node();
    // A custom layout-level hidden signal always wins.
    if (node.hidden) return node.hidden();
    // Otherwise defer to the related field's native hidden() (signal forms schema rule):
    // always present for controls, optional for groups/arrays that map to a field.
    return node.field?.().hidden() ?? false;
  });

  /** Resolved component type (explicit `component`, else `type` via the registry), or null for fallback rendering. */
  protected readonly resolvedComponent = computed(
    (): Type<unknown> | null => this.node().component ?? this.registry[this.node().type!] ?? null,
  );

  /**
   * Host directives applied to the resolved component. For a control node whose component
   * implements `FormValueControl<T>`, attaches `FormField` bound to the field so the
   * component's value/errors/touched/disabled are wired automatically. Undefined otherwise.
   */
  protected readonly directives = computed((): DirectiveWithBindings<unknown>[] | undefined => {
    const node = this.node();
    const comp = this.resolvedComponent();
    if (!comp || node.kind !== 'control' || !isFormValueControl(comp)) return undefined;
    const field = node.field;
    return [{ type: FormField, bindings: [inputBinding('formField', () => field)] }];
  });

  /**
   * Reactive input bindings for the resolved component, by node kind:
   * - control + FormValueControl: only custom props (value etc. come from the FormField directive)
   * - control (plain): `field` + `state` inputs, plus props
   * - group: `children` (the keyed record), plus props
   * - array (renderer-owned, no itemLayout): `field`, plus props
   * - array (library-iterated): `children` (the per-item LayoutNodes), plus props
   */
  protected readonly bindings = computed((): Binding[] => {
    const node = this.node();
    const comp = this.resolvedComponent();
    const props = propsToBindings(node.props);

    if (node.kind === 'control') {
      if (comp && isFormValueControl(comp)) return props;
      const { field } = node;
      return [inputBinding('field', () => field), inputBinding('state', () => field()), ...props];
    }
    if (node.kind === 'group') {
      const { children } = node;
      return [inputBinding('children', () => children), ...props];
    }
    // array
    if (node.field && !node.itemLayout) {
      const { field } = node;
      return [inputBinding('field', () => field), ...props];
    }
    return [inputBinding('children', () => this.arrayItems()), ...props];
  });

  // Caches one computed per item field, keyed by the field's identity. Signal forms
  // preserves a field's identity across value changes (only structural changes — add,
  // remove, reorder — swap identities), so the same item always yields the same
  // LayoutNode reference. That lets `@for (track node)` reuse components when the user
  // types, instead of recreating them and losing focus. WeakMap, so dropped items are GC'd.
  private readonly _itemComputeds = new WeakMap<object, Signal<LayoutNode>>();

  private readonly arrayItems = computed((): LayoutNode[] => {
    const node = this.node();
    if (node.kind !== 'array' || !node.field || !node.itemLayout) return [];
    const { field, itemLayout } = node;
    return Array.from(field, (itemField) => {
      const key = itemField as object;
      let item = this._itemComputeds.get(key);
      if (!item) {
        item = computed(() => itemLayout(itemField as FieldTree<any>));
        this._itemComputeds.set(key, item);
      }
      return item();
    });
  });

  /** Children to render when no wrapper component is resolved (groups/arrays only). */
  protected readonly children = computed((): LayoutNode[] => {
    const node = this.node();
    if (node.kind === 'group') return Object.values(node.children);
    if (node.kind === 'array') return this.arrayItems();
    return [];
  });

  /** Dev-mode warning when a control node has no component resolved. */
  readonly #warnMissingControl = effect(() => {
    if (this.node().kind === 'control' && !this.resolvedComponent()) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[ngx-signal-forms-renderer] No component resolved for control node.`,
          `Provide a 'component' or 'type' in the control() call, or register a type in provideSignalFormsRenderer().`,
        );
      }
    }
  });
}

/**
 * Detects whether a component implements `FormValueControl<T>` by inspecting its compiled
 * definition (`ɵcmp`) for a `value` input and a `valueChange` output — the two-way `value`
 * contract `FormField` binds to. Reads the internal def because there's no public runtime
 * marker for the interface.
 */
function isFormValueControl(comp: Type<unknown>): boolean {
  const cmpDef = (comp as any).ɵcmp;
  return cmpDef?.inputs?.value !== undefined && cmpDef?.outputs?.valueChange !== undefined;
}

/**
 * Converts a props record into input bindings. Signal-valued props are bound directly so the
 * component stays subscribed to them; plain values are wrapped in a constant accessor.
 */
function propsToBindings(props?: Record<string, unknown>): Binding[] {
  if (!props) return [];
  return Object.entries(props).map(([key, value]) =>
    inputBinding(key, isSignal(value) ? (value as Signal<unknown>) : () => value),
  );
}
