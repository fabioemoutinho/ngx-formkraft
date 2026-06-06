/*
 * Public API Surface of ngx-formkraft
 */

// Types
export type {
  LayoutNode,
  LayoutNodeOptions,
  ControlNode,
  GroupNode,
  ArrayNode,
} from './lib/layout-types';

// Builder functions
export { layout, control, group, array } from './lib/layout';
export type { ContainerOptions, LayoutSignal } from './lib/layout';

// Provider
export { provideFormKraft, FORMKRAFT_TYPE_REGISTRY } from './lib/provider';
export type { FormKraftConfig, FormKraftTypeRegistry } from './lib/provider';

// Components and directives
export { FkFormComponent } from './lib/fk-form.component';
export { FkNodeComponent } from './lib/fk-node.component';
export { FkChildrenComponent } from './lib/children.component';
export { FkComponentOutletDirective } from './lib/fk-component-outlet.directive';
