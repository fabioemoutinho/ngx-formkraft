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
 * `fkComponentOutletBindings` and `fkComponentOutletDirectives`.
 * These are incompatible with `fkComponentOutletInputs`.
 */
@Directive({
  selector: '[fkComponentOutlet]',
  standalone: true,
})
export class FkComponentOutletDirective implements OnChanges, DoCheck, OnDestroy {
  @Input() fkComponentOutlet: Type<unknown> | null = null;
  /** Note: incompatible with `fkComponentOutletBindings`. */
  @Input() fkComponentOutletInputs?: Record<string, unknown>;
  /** Note: incompatible with `fkComponentOutletInputs`. */
  @Input() fkComponentOutletBindings?: Binding[];
  @Input() fkComponentOutletDirectives?: (Type<unknown> | DirectiveWithBindings<unknown>)[];

  private readonly _vcr = inject(ViewContainerRef);
  private _ref: ComponentRef<unknown> | undefined;
  private _inputsUsed = new Map<string, boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    if (ngDevMode && this.fkComponentOutletInputs && this.fkComponentOutletBindings) {
      throw new Error(
        '[fkComponentOutlet] fkComponentOutletInputs and fkComponentOutletBindings are incompatible.',
      );
    }
    if (this._needToReCreate(changes)) {
      this._vcr.clear();
      this._inputsUsed.clear();
      this._ref = undefined;
      if (this.fkComponentOutlet) {
        this._ref = this._vcr.createComponent(this.fkComponentOutlet, {
          bindings: this.fkComponentOutletBindings,
          directives: this.fkComponentOutletDirectives,
        });
      }
    }
  }

  ngDoCheck(): void {
    if (this._ref && !this.fkComponentOutletBindings) {
      if (this.fkComponentOutletInputs) {
        for (const inputName of Object.keys(this.fkComponentOutletInputs)) {
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
      'fkComponentOutlet' in changes ||
      'fkComponentOutletBindings' in changes ||
      'fkComponentOutletDirectives' in changes
    );
  }

  private _applyInputStateDiff(ref: ComponentRef<unknown>): void {
    for (const [inputName, touched] of this._inputsUsed) {
      if (!touched) {
        ref.setInput(inputName, undefined);
        this._inputsUsed.delete(inputName);
      } else {
        ref.setInput(inputName, this.fkComponentOutletInputs?.[inputName]);
        this._inputsUsed.set(inputName, false);
      }
    }
  }
}
