/*
 * Public API Surface of ngx-formkraft
 */

// Types
export type { FieldDefs } from './lib/types';
export type {
  LayoutNode,
  LayoutNodeOptions,
  ControlNode,
  GroupNode,
  ArrayNode,
} from './lib/layout-types';

// Builder functions
export { layout, control, group, array } from './lib/layout';
export type { GroupOptions, ArrayOptions } from './lib/layout';

// Provider
export { provideFormKraft, FORMKRAFT_TYPE_REGISTRY } from './lib/provider';
export type { FormKraftConfig, FormKraftTypeRegistry } from './lib/provider';

// Components
export { FkFormComponent } from './lib/fk-form.component';
export { FkNodeComponent } from './lib/fk-node.component';
export { FkRenderChildrenComponent } from './lib/render-children.component';
