import {
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  ChangeDetectionStrategy,
  Type,
  isSignal,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { FieldTree } from '@angular/forms/signals';
import { LayoutNode, ControlNode, GroupNode, ArrayNode } from './layout-types';
import { FieldDefs } from './types';
import { FORMKRAFT_TYPE_REGISTRY } from './provider';

/**
 * Recursive layout node renderer.
 * Receives a LayoutNode and renders the appropriate component
 * using NgComponentOutlet with computed input bindings.
 *
 * For control nodes, `field` and `state` inputs are passed automatically,
 * so components implementing FormValueControl<T> get value, errors,
 * touched, disabled, etc. bound automatically via [formField].
 */
@Component({
  selector: 'fk-node',
  imports: [NgComponentOutlet, forwardRef(() => FkNodeComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!isHidden()) {
      @if (resolvedComponent(); as comp) {
        <ng-container *ngComponentOutlet="comp; inputs: componentInputs()" />
      } @else {
        @for (child of fallbackChildren(); track $index) {
          <fk-node [node]="child" [fieldDefs]="fieldDefs()" />
        }
      }
    }
  `,
})
export class FkNodeComponent {
  readonly node = input.required<LayoutNode>();
  readonly fieldDefs = input<FieldDefs<unknown>>();

  private readonly registry = inject(FORMKRAFT_TYPE_REGISTRY);

  protected readonly isHidden = computed(() => {
    const node = this.node();

    return (
      (node as ControlNode).field?.().hidden() ??
      (node as GroupNode | ArrayNode).hidden?.() ??
      false
    );
  });

  /** Resolved component type, or null if fallback rendering should be used. */
  protected readonly resolvedComponent = computed((): Type<unknown> | null => {
    const node = this.node();
    return this.resolveComponent(node);
  });

  /** Input bindings for the resolved component. */
  protected readonly componentInputs = computed((): Record<string, unknown> => {
    const node = this.node();
    const fieldDefs = this.fieldDefs();
    switch (node.kind) {
      case 'control':
        return {
          field: node.field,
          state: node.field(),
          ...this.resolveProps(node.props),
        };
      case 'group':
        return {
          name: node.name,
          children: node.children,
          fieldDefs,
          ...this.resolveProps(node.props),
        };
      case 'array':
        return {
          field: node.field,
          ...this.resolveProps(node.props),
        };
    }
  });

  /** Children to render when no wrapper component is resolved (groups/arrays only). */
  protected readonly fallbackChildren = computed((): LayoutNode[] => {
    const node = this.node();

    if (node.kind === 'group') return node.children;

    if (node.kind === 'array' && node.itemLayout) {
      const items = node.field as unknown as ReadonlyArray<FieldTree<unknown>>;
      const nodes: LayoutNode[] = [];
      for (let i = 0; i < items.length; i++) {
        nodes.push(...node.itemLayout(items[i] as FieldTree<never>, i));
      }
      return nodes;
    }

    return [];
  });

  /** Dev-mode warning when a control node has no component resolved. */
  readonly #warnMissingControl = effect(() => {
    const node = this.node();
    if (node.kind === 'control' && !this.resolvedComponent()) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[ngx-formkraft] No component resolved for control node.`,
          `Provide a 'component' or 'type' in the control() call, or register a type in provideFormKraft().`,
        );
      }
    }
  });

  /**
   * Resolves the component for any layout node.
   * Priority: node.component > node.type via registry
   */
  private resolveComponent(node: LayoutNode): Type<unknown> | null {
    return node.component ?? this.registry[node.type!] ?? null;
  }

  /**
   * Evaluates prop values, subscribing to signals if necessary.
   */
  private resolveProps(props?: Record<string, unknown | (() => unknown)>): Record<string, unknown> {
    if (!props) return {};
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      resolved[key] = isSignal(value) ? value() : value;
    }
    return resolved;
  }
}
