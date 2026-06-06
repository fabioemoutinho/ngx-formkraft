import {
  Binding,
  ComponentRef,
  Directive,
  DoCheck,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Type,
  ViewContainerRef,
  DirectiveWithBindings,
} from '@angular/core';

/**
 * Renders a component dynamically, equivalent to NgComponentOutlet after
 * https://github.com/angular/angular/pull/63101 is merged.
 *
 * Supports reactive signal bindings and dynamic host directives via
 * `sfrComponentOutletBindings` and `sfrComponentOutletDirectives`.
 * These are incompatible with `sfrComponentOutletInputs`.
 */
@Directive({
  selector: '[sfrComponentOutlet]',
  standalone: true,
})
export class SfrComponentOutletDirective implements OnChanges, DoCheck, OnDestroy {
  @Input() sfrComponentOutlet: Type<unknown> | null = null;
  /** Note: incompatible with `sfrComponentOutletBindings`. */
  @Input() sfrComponentOutletInputs?: Record<string, unknown>;
  /** Note: incompatible with `sfrComponentOutletInputs`. */
  @Input() sfrComponentOutletBindings?: Binding[];
  @Input() sfrComponentOutletDirectives?: (Type<unknown> | DirectiveWithBindings<unknown>)[];

  private readonly _vcr = inject(ViewContainerRef);
  private _ref: ComponentRef<unknown> | undefined;
  private _inputsUsed = new Map<string, boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    if (ngDevMode && this.sfrComponentOutletInputs && this.sfrComponentOutletBindings) {
      throw new Error(
        '[sfrComponentOutlet] sfrComponentOutletInputs and sfrComponentOutletBindings are incompatible.',
      );
    }
    if (this._needToReCreate(changes)) {
      this._vcr.clear();
      this._inputsUsed.clear();
      this._ref = undefined;
      if (this.sfrComponentOutlet) {
        this._ref = this._vcr.createComponent(this.sfrComponentOutlet, {
          bindings: this.sfrComponentOutletBindings,
          directives: this.sfrComponentOutletDirectives,
        });
      }
    }
  }

  ngDoCheck(): void {
    if (this._ref && !this.sfrComponentOutletBindings) {
      if (this.sfrComponentOutletInputs) {
        for (const inputName of Object.keys(this.sfrComponentOutletInputs)) {
          this._inputsUsed.set(inputName, true);
        }
      }
      this._applyInputStateDiff(this._ref);
    }
  }

  ngOnDestroy(): void {
    this._ref = undefined;
  }

  private _needToReCreate(changes: SimpleChanges): boolean {
    return (
      'sfrComponentOutlet' in changes ||
      'sfrComponentOutletBindings' in changes ||
      'sfrComponentOutletDirectives' in changes
    );
  }

  private _applyInputStateDiff(ref: ComponentRef<unknown>): void {
    for (const [inputName, touched] of this._inputsUsed) {
      if (!touched) {
        ref.setInput(inputName, undefined);
        this._inputsUsed.delete(inputName);
      } else {
        ref.setInput(inputName, this.sfrComponentOutletInputs?.[inputName]);
        this._inputsUsed.set(inputName, false);
      }
    }
  }
}
