import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { SfrFormComponent, layout } from 'ngx-signal-forms-renderer';
import { CheckoutModel, emptyOrder, sampleOrder } from './checkout.model';
import { checkoutRules } from './checkout.rules';
import { checkoutSchema, buildCheckoutLayout } from './form-config';
import { productOf } from './catalog';

const GH = 'https://github.com/fabioemoutinho/ngx-signal-forms-renderer/blob/main/projects/demo/src/app/checkout';

@Component({
  selector: 'app-checkout',
  imports: [SfrFormComponent, JsonPipe, MatButton],
  template: `
    <header class="hero">
      <div>
        <h1>Forms from data</h1>
        <p>A plain schema becomes a live Angular form — rendered, reactive, and validated by Signal Forms.</p>
      </div>
      <a class="gh" href="https://github.com/fabioemoutinho/ngx-signal-forms-renderer" target="_blank" rel="noopener">GitHub ↗</a>
    </header>

    <div class="panes">
      <!-- Schema (data) -->
      <section class="pane side">
        <h2>Schema <span>data</span></h2>
        <pre class="code">{{ schemaJson }}</pre>
        <details>
          <summary>How it's wired</summary>
          <ul class="links">
            <li><a [href]="gh + '/form-config.ts'" target="_blank" rel="noopener">schema → layout adapter</a></li>
            <li><a [href]="gh + '/checkout.rules.ts'" target="_blank" rel="noopener">validation + stock metadata</a></li>
            <li><a [href]="gh + '/catalog.ts'" target="_blank" rel="noopener">product catalog</a></li>
          </ul>
        </details>
      </section>

      <!-- Rendered form -->
      <section class="pane">
        <h2>Form <span>rendered</span></h2>
        <div class="toolbar">
          <button matButton="outlined" (click)="loadSample()" [disabled]="loading()">
            {{ loading() ? 'Loading…' : 'Load sample order' }}
          </button>
          <button matButton (click)="reset()">Reset</button>
        </div>

        <sfr-form [form]="checkout" [layout]="checkoutLayout" />

        <div class="summary">
          <span class="total">Total: \${{ total() }}</span>
          <span class="status" [class.invalid]="checkout().invalid()">
            {{ checkout().invalid() ? 'Has errors' : 'Valid' }}
          </span>
        </div>
      </section>

      <!-- Live value -->
      <section class="pane side">
        <h2>Value <span>output</span></h2>
        <pre class="code">{{ checkout().value() | json }}</pre>
      </section>
    </div>

    <div class="flow"><span>data</span> → <span>form</span> → <span>value</span></div>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
    .hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    .hero h1 { margin: 0 0 4px; font-size: 28px; }
    .hero p { margin: 0; color: #555; max-width: 60ch; }
    .gh { white-space: nowrap; text-decoration: none; color: #1976d2; font-weight: 500; }
    .panes { display: grid; grid-template-columns: 0.9fr 1.2fr 0.9fr; gap: 16px; align-items: start; }
    .pane { border: 1px solid #e4e4e7; border-radius: 10px; padding: 16px; background: #fff; }
    .pane h2 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: #3f3f46; }
    .pane h2 span { text-transform: none; letter-spacing: 0; color: #a1a1aa; font-weight: 400; margin-left: 6px; }
    /* Schema + Value panes stay in view while the form scrolls; bounded to the viewport. */
    .pane.side { position: sticky; top: 16px; max-height: calc(100vh - 32px); display: flex; flex-direction: column; }
    .code { background: #f4f4f5; border-radius: 8px; padding: 12px; font-size: 12px; line-height: 1.5; overflow: auto; }
    .pane.side .code { flex: 1 1 auto; min-height: 0; }
    @media (max-width: 1000px) {
      .panes { grid-template-columns: 1fr; }
      .pane.side { position: static; max-height: none; }
    }
    .toolbar { display: flex; gap: 8px; margin: 8px 0 16px; flex-wrap: wrap; }
    .summary { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 12px; border-top: 1px solid #eee; }
    .total { font-weight: 600; font-size: 16px; }
    .status { font-size: 13px; color: #2e7d32; }
    .status.invalid { color: #d32f2f; }
    details { margin-top: 12px; font-size: 13px; }
    summary { cursor: pointer; color: #3f3f46; }
    .links { margin: 8px 0 0; padding-left: 18px; }
    .links a { color: #1976d2; text-decoration: none; }
    .flow { text-align: center; margin-top: 20px; color: #a1a1aa; font-size: 13px; letter-spacing: 0.1em; }
    .flow span { color: #3f3f46; font-weight: 500; }
  `,
})
export class CheckoutComponent {
  protected readonly gh = GH;
  protected readonly schemaJson = JSON.stringify(checkoutSchema, null, 2);

  protected readonly loading = signal(false);
  private readonly model = signal<CheckoutModel>(emptyOrder());

  protected readonly checkout = form(this.model, checkoutRules);

  protected readonly checkoutLayout = layout(this.checkout, (f) =>
    buildCheckoutLayout(f, {
      moveItem: (from, to) => this.moveItem(from, to),
      addItem: () => this.addItem(),
      removeItem: (index) => this.removeItem(index),
    }),
  );

  protected readonly total = computed(() =>
    this.checkout()
      .value()
      .items.reduce((sum, it) => sum + (productOf(it.sku)?.price ?? 0) * (it.quantity || 0), 0)
      .toFixed(2),
  );

  protected addItem(): void {
    this.model.update((m) => ({ ...m, items: [...m.items, { sku: 'SKU-1', quantity: 1 }] }));
  }

  protected removeItem(index: number): void {
    this.model.update((m) => ({ ...m, items: m.items.filter((_, i) => i !== index) }));
  }

  protected moveItem(from: number, to: number): void {
    this.model.update((m) => {
      const items = [...m.items];
      [items[from], items[to]] = [items[to], items[from]];
      return { ...m, items };
    });
  }

  protected reset(): void {
    this.model.set(emptyOrder());
  }

  /** Simulated async load of an existing order — proves create vs edit + hydration. */
  protected loadSample(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.model.set(sampleOrder());
      this.loading.set(false);
    }, 600);
  }
}
