import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';

/**
 * Registry mapping string type keys to component types.
 * A single unified registry for fields, groups, and arrays.
 */
export type SignalFormsRendererTypeRegistry = Record<string, Type<unknown>>;

/** @internal */
export const SIGNAL_FORMS_RENDERER_TYPE_REGISTRY = new InjectionToken<SignalFormsRendererTypeRegistry>(
  'SIGNAL_FORMS_RENDERER_TYPE_REGISTRY',
  { factory: () => ({}) },
);

/**
 * Configuration for provideSignalFormsRenderer().
 */
export interface SignalFormsRendererConfig {
  /**
   * Map of string type keys to component types.
   * Used for fields, groups, and arrays alike.
   *
   * @example
   * {
   *   text: TextInputComponent,
   *   select: SelectComponent,
   *   card: CardGroupComponent,
   *   repeatable: RepeatableSectionComponent,
   * }
   */
  types?: SignalFormsRendererTypeRegistry;
}

/**
 * Provides the SignalFormsRenderer configuration at the environment level.
 *
 * @example
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideSignalFormsRenderer({
 *       types: {
 *         text: TextInputComponent,
 *         select: SelectComponent,
 *         card: CardGroupComponent,
 *       }
 *     })
 *   ]
 * };
 */
export function provideSignalFormsRenderer(config: SignalFormsRendererConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: SIGNAL_FORMS_RENDERER_TYPE_REGISTRY,
      useValue: config.types ?? {},
    },
  ]);
}
