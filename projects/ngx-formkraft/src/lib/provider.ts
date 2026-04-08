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
export type FormKraftTypeRegistry = Record<string, Type<unknown>>;

/** @internal */
export const FORMKRAFT_TYPE_REGISTRY = new InjectionToken<FormKraftTypeRegistry>(
  'FORMKRAFT_TYPE_REGISTRY',
);

/**
 * Configuration for provideFormKraft().
 */
export interface FormKraftConfig {
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
  types?: FormKraftTypeRegistry;
}

/**
 * Provides the FormKraft configuration at the environment level.
 *
 * @example
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideFormKraft({
 *       types: {
 *         text: TextInputComponent,
 *         select: SelectComponent,
 *         card: CardGroupComponent,
 *       }
 *     })
 *   ]
 * };
 */
export function provideFormKraft(config: FormKraftConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FORMKRAFT_TYPE_REGISTRY,
      useValue: config.types ?? {},
    },
  ]);
}
