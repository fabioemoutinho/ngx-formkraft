import {
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
  ViewContainerRef,
  ChangeDetectionStrategy,
  Type,
  inputBinding,
  Binding,
} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { LayoutNode, FieldNode, GroupNode, ArrayNode } from './layout-types';
import { FieldDef, FieldDefs } from './types';
import { FORMKRAFT_TYPE_REGISTRY } from './provider';

/**
 * Recursive layout node renderer.
 * Receives a LayoutNode and renders the appropriate component.
 */
@Component({
  selector: 'fk-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class FkNodeComponent {
  readonly node = input.required<LayoutNode>();
  readonly fieldDefs = input<FieldDefs<unknown>>();

  private readonly registry = inject(FORMKRAFT_TYPE_REGISTRY, { optional: true }) ?? {};
  private readonly vcr = inject(ViewContainerRef);

  readonly #render = effect(() => {
    const node = this.node();
    const fieldDefs = this.fieldDefs();

    // For groups/arrays, check hidden signal
    let isHidden = false;
    if (node.kind === 'group' || node.kind === 'array') {
      isHidden = node.hidden?.() ?? false;
    }
    // For fields, hidden is driven by signal forms (read from FieldState)
    if (node.kind === 'field') {
      isHidden = node.field().hidden();
    }

    untracked(() => {
      this.vcr.clear();
      if (isHidden) return;

      switch (node.kind) {
        case 'field':
          this.renderField(node);
          break;
        case 'group':
          this.renderGroup(node, fieldDefs);
          break;
        case 'array':
          this.renderArray(node, fieldDefs);
          break;
      }
    });
  });

  private renderField(node: FieldNode): void {
    const componentType = this.resolveFieldComponent(node);
    if (!componentType) {
      console.warn(`[ngx-formkraft] No component resolved for field node. Provide a 'component' or 'type' in the field def or layout.`);
      return;
    }

    const bindings = this.buildFieldBindings(node);
    this.vcr.createComponent(componentType, { bindings });
  }

  private renderGroup(node: GroupNode, fieldDefs?: FieldDefs<unknown>): void {
    const componentType = this.resolveNodeComponent(node);

    if (componentType) {
      // Custom group wrapper — pass children + fieldDefs as inputs
      const bindings: Binding[] = [
        inputBinding('name', () => node.name),
        inputBinding('children', () => node.children),
        inputBinding('fieldDefs', () => fieldDefs),
        ...this.buildPropsBindings(node.props),
      ];
      this.vcr.createComponent(componentType, { bindings });
    } else {
      // No wrapper: render children sequentially
      for (const child of node.children) {
        this.vcr.createComponent(FkNodeComponent, {
          bindings: [
            inputBinding('node', () => child),
            inputBinding('fieldDefs', () => fieldDefs),
          ],
        });
      }
    }
  }

  private renderArray(node: ArrayNode, fieldDefs?: FieldDefs<unknown>): void {
    const componentType = this.resolveNodeComponent(node);

    if (componentType) {
      // Custom array container handles everything
      const bindings: Binding[] = [
        inputBinding('field', () => node.field),
        ...this.buildPropsBindings(node.props),
      ];
      this.vcr.createComponent(componentType, { bindings });
      return;
    }

    if (node.itemLayout) {
      // Library renders each item using the itemLayout function
      const arrayField = node.field as unknown as ArrayLike<FieldTree<unknown>>;
      for (let i = 0; i < arrayField.length; i++) {
        const itemField = arrayField[i];
        const childNodes = node.itemLayout(itemField as any, i);
        for (const childNode of childNodes) {
          this.vcr.createComponent(FkNodeComponent, {
            bindings: [
              inputBinding('node', () => childNode),
              inputBinding('fieldDefs', () => fieldDefs),
            ],
          });
        }
      }
    }
  }

  /**
   * Resolves the component for a field node.
   * Priority: node.component > node.def.component > fieldDefs[key].component
   *           > node.type via registry > node.def.type via registry > fieldDefs[key].type via registry
   */
  private resolveFieldComponent(node: FieldNode): Type<unknown> | null {
    // Direct component refs (highest priority)
    if (node.component) return node.component;
    if (node.def?.component) return node.def.component;

    // Type via registry
    if (node.type && this.registry[node.type]) return this.registry[node.type];
    if (node.def?.type && this.registry[node.def.type]) return this.registry[node.def.type];

    return null;
  }

  /**
   * Resolves the component for a group or array node.
   * Priority: node.component > node.type via registry
   */
  private resolveNodeComponent(node: GroupNode | ArrayNode): Type<unknown> | null {
    if (node.component) return node.component;
    if (node.type && this.registry[node.type]) return this.registry[node.type];
    return null;
  }

  private buildFieldBindings(node: FieldNode): Binding[] {
    const bindings: Binding[] = [
      inputBinding('field', () => node.field),
    ];

    // Merge props: def.props first, then node-level props override
    const mergedProps = { ...node.def?.props, ...node.props };
    bindings.push(...this.buildPropsBindings(mergedProps));

    return bindings;
  }

  private buildPropsBindings(
    props?: Record<string, unknown | (() => unknown)>,
  ): Binding[] {
    if (!props) return [];
    return Object.entries(props).map(([key, value]) => {
      const getter = typeof value === 'function' ? (value as () => unknown) : () => value;
      return inputBinding(key, getter);
    });
  }
}
