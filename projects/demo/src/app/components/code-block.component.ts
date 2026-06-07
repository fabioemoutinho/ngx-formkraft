import { Component, computed, input, signal } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);

/** A syntax-highlighted code block with a copy-to-clipboard button. */
@Component({
  selector: 'app-code-block',
  template: `
    <button class="copy" type="button" (click)="copy()" [class.copied]="copied()">
      {{ copied() ? 'Copied' : 'Copy' }}
    </button>
    <pre><code class="hljs" [innerHTML]="highlighted()"></code></pre>
  `,
  styles: `
    :host { display: flex; flex-direction: column; position: relative; min-height: 0; }
    pre { flex: 1 1 auto; min-height: 0; margin: 0; overflow: auto; background: #f4f4f5; border-radius: 8px; scrollbar-width: thin; scrollbar-color: #c7c7cc transparent; }
    pre::-webkit-scrollbar { width: 10px; height: 10px; }
    pre::-webkit-scrollbar-thumb { background: #c7c7cc; border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
    pre::-webkit-scrollbar-track { background: transparent; }
    /* code.hljs beats the global theme's .hljs for layout; the theme keeps the token colors. */
    code.hljs { display: block; padding: 12px; font-size: 12px; line-height: 1.5; background: transparent; }
    /* Floating, inset past the thin scrollbar so it never sits on top of it. */
    .copy {
      position: absolute; top: 8px; right: 12px; z-index: 1;
      font: inherit; font-size: 11px; padding: 3px 9px; cursor: pointer;
      border: 1px solid #d4d4d8; border-radius: 6px; background: #fff; color: #3f3f46;
    }
    .copy:hover { background: #f4f4f5; }
    .copy.copied { color: #2e7d32; border-color: #a5d6a7; }
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<'typescript' | 'json'>('typescript');

  protected readonly highlighted = computed(
    () => hljs.highlight(this.code(), { language: this.lang() }).value,
  );

  protected readonly copied = signal(false);

  protected copy(): void {
    navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }
}
