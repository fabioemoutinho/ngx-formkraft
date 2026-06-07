import { Component, computed, signal, viewChild } from '@angular/core';
import { CheckoutFormComponent } from './checkout-form.component';
import { CodeBlockComponent } from '../components/code-block.component';
import { checkoutSchema } from './checkout.schema';

const REPO = 'https://github.com/fabioemoutinho/ngx-signal-forms-renderer';
const GH = `${REPO}/blob/main/projects/demo/src/app`;

/** Source files for the "How it's built" walkthrough — copied into the build (angular.json assets). */
const BUILD_FILES = [
  {
    step: 1,
    label: 'external schema',
    optional: true,
    file: 'checkout/checkout.schema.ts',
    blurb:
      'Plain data describing the form — the kind of config you could store or load from a server. Optional: one way to drive the layout. The same data could also feed a second adapter that generates the Signal Forms schema; here it only generates the layout.',
  },
  {
    step: 2,
    label: 'form schema',
    optional: false,
    file: 'checkout/checkout.form-schema.ts',
    blurb:
      'The Signal Forms schema — validation, metadata (catalog stock) and conditional visibility, passed to form(model, schema). Written directly; the renderer never touches it.',
  },
  {
    step: 3,
    label: 'layout',
    optional: false,
    file: 'checkout/schema-adapter.ts',
    blurb:
      'The renderer layout — which component renders each field. Required: it is what you hand to <sfr-form>. Built with control/group/array (it takes the form as input). Here an adapter generates it from the external schema, but you could write it by hand just the same — the README has simpler, hand-written examples.',
  },
  {
    step: 4,
    label: 'usage',
    optional: false,
    file: 'checkout/checkout-form.component.ts',
    blurb:
      'Ties it together: create the signal form, build the layout (here via the adapter), and render with <sfr-form>.',
  },
];

/**
 * Demo page (shell): the live Schema / Form / Value tri-pane, plus a "How it's built" walkthrough
 * of the source. The actual form lives in CheckoutFormComponent; this only presents it.
 */
@Component({
  selector: 'app-checkout',
  imports: [CheckoutFormComponent, CodeBlockComponent],
  template: `
    <header class="hero">
      <div>
        <h1>ngx-signal-forms-renderer</h1>
        <p>Forms from data — a plain schema becomes a live Angular form, rendered, reactive, and validated by Signal Forms.</p>
        <div class="install">
          <code>{{ installCmd }}</code>
          <button type="button" (click)="copyInstall()" [class.copied]="installCopied()">
            {{ installCopied() ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </div>
      <a class="gh" [href]="repo" target="_blank" rel="noopener" aria-label="View on GitHub" title="View on GitHub">
        <svg viewBox="0 0 16 16" width="26" height="26" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
    </header>

    <div class="panes">
      <section class="pane side">
        <h2>Schema <span>data</span></h2>
        <app-code-block [code]="schemaJson" lang="json" />
      </section>

      <section class="pane">
        <h2>Form <span>rendered</span></h2>
        <div class="hints">
          <span class="hint-label">Try it</span>
          <span class="chip">Switch plan → Pro</span>
          <span class="chip">Set a qty above stock</span>
          <span class="chip">Toggle “billing same as shipping”</span>
          <span class="chip">Reorder items</span>
        </div>
        <app-checkout-form />
      </section>

      <section class="pane side">
        <h2>Value <span>output</span></h2>
        <app-code-block [code]="valueJson()" lang="json" />
      </section>
    </div>

    <div class="flow"><span>data</span> → <span>form</span> → <span>value</span></div>

    <section class="built">
      <h2>How it's built</h2>
      <div class="filetabs">
        @for (f of buildFiles; track f.file) {
          <button [class.active]="activeFile() === f.file" (click)="activeFile.set(f.file)">
            {{ f.step }}. {{ f.label }}@if (f.optional) {<span class="opt"> · optional</span>}
          </button>
        }
      </div>
      <p class="blurb">{{ activeMeta().blurb }}</p>
      <app-code-block class="built-pre" [code]="source()[activeFile()] ?? 'Loading…'" lang="typescript" />
      <a class="src" [href]="gh + '/' + activeFile()" target="_blank" rel="noopener">View on GitHub ↗</a>
    </section>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
    .hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    .hero h1 { margin: 0 0 6px; font-size: 30px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: -0.5px; }
    .hero p { margin: 0; color: #555; max-width: 60ch; }
    .install { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 5px 5px 5px 12px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
    .install code { color: #1a1a1a; }
    .install button { font: inherit; font-size: 12px; padding: 3px 10px; border: 1px solid #d4d4d8; border-radius: 6px; background: #fff; cursor: pointer; color: #3f3f46; }
    .install button.copied { color: #2e7d32; border-color: #a5d6a7; }
    .hints { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 14px; }
    .hint-label { font-size: 12px; font-weight: 600; color: #6b7280; }
    .chip { font-size: 12px; padding: 3px 9px; border-radius: 999px; background: #eef2ff; color: #3730a3; border: 1px solid #e0e7ff; }
    .gh { color: #1a1a1a; flex-shrink: 0; }
    .gh:hover { color: #1976d2; }
    .gh svg { display: block; }
    .panes { display: grid; grid-template-columns: 0.9fr 1.2fr 0.9fr; gap: 16px; align-items: start; }
    .pane { min-width: 0; border: 1px solid #e4e4e7; border-radius: 10px; padding: 16px; background: #fff; }
    .pane h2 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: #3f3f46; }
    .pane h2 span { text-transform: none; letter-spacing: 0; color: #a1a1aa; font-weight: 400; margin-left: 6px; }
    /* Schema + Value panes stay in view while the form scrolls; bounded to the viewport. */
    .pane.side { position: sticky; top: 16px; max-height: calc(100vh - 32px); display: flex; flex-direction: column; }
    .pane.side app-code-block { flex: 1 1 auto; min-height: 0; }
    @media (max-width: 1000px) {
      .panes { grid-template-columns: 1fr; }
      .pane.side { position: static; max-height: none; }
    }
    .flow { text-align: center; margin: 20px 0; color: #a1a1aa; font-size: 13px; letter-spacing: 0.1em; }
    .flow span { color: #3f3f46; font-weight: 500; }
    .built { margin-top: 28px; border-top: 1px solid #eee; padding-top: 20px; }
    .built > h2 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: #3f3f46; }
    .filetabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .filetabs button { font: inherit; font-size: 13px; padding: 6px 12px; border: 1px solid #e4e4e7; background: #fff; border-radius: 6px; cursor: pointer; color: #3f3f46; }
    .filetabs button.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
    .opt { color: #a1a1aa; font-weight: 400; }
    .blurb { margin: 0 0 10px; color: #555; font-size: 13px; max-width: 80ch; }
    .built-pre { max-height: 70vh; }
    .src { display: inline-block; margin-top: 10px; font-size: 13px; color: #1976d2; text-decoration: none; }
  `,
})
export class CheckoutComponent {
  protected readonly repo = REPO;
  protected readonly gh = GH;
  protected readonly installCmd = 'npm install ngx-signal-forms-renderer';
  protected readonly installCopied = signal(false);
  protected readonly buildFiles = BUILD_FILES;
  protected readonly schemaJson = JSON.stringify(checkoutSchema, null, 2);

  /** Selected file in the "How it's built" walkthrough. */
  protected readonly activeFile = signal(BUILD_FILES[0].file);
  protected readonly activeMeta = computed(() => BUILD_FILES.find((f) => f.file === this.activeFile())!);

  /** The embedded form — its value feeds the Value pane. */
  protected readonly form = viewChild(CheckoutFormComponent);
  protected readonly valueJson = computed(() => JSON.stringify(this.form()?.value() ?? null, null, 2));

  /** Lazily-fetched source files (bundled as assets), keyed by their asset path. */
  protected readonly source = signal<Record<string, string>>({});

  protected copyInstall(): void {
    navigator.clipboard.writeText(this.installCmd).then(() => {
      this.installCopied.set(true);
      setTimeout(() => this.installCopied.set(false), 1500);
    });
  }

  constructor() {
    for (const { file } of BUILD_FILES) {
      fetch(new URL('source/' + file, document.baseURI))
        .then((r) => r.text())
        .then((text) => this.source.update((s) => ({ ...s, [file]: text })))
        .catch(() => this.source.update((s) => ({ ...s, [file]: '// failed to load source' })));
    }
  }
}
