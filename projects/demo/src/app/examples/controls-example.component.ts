import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required, min } from '@angular/forms/signals';
import { FkFormComponent, control, group, layout } from 'ngx-formkraft';
import { CardGroupComponent } from '../components/card-group.component';
import { RatingInputComponent } from '../components/rating-input.component';

interface FeedbackForm {
  name: string;
  email: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-controls-example',
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Control Patterns — Wrapping vs Custom</h3>
    <p>Two ways to build control components for ngx-formkraft:</p>

    <section class="demo-section">
      <fk-form [form]="feedbackForm" [layout]="feedbackLayout" />
      <pre>Value: {{ feedbackForm().value() | json }}</pre>
    </section>

    <section class="code-section">
      <h4>Pattern A: Wrapping existing controls (Material, PrimeNG, etc.)</h4>
      <p>Receive <code>field</code> and <code>state</code> inputs. Put <code>[formField]</code> on the inner element.
         The directive handles value sync, touched, disabled, required — automatically.</p>
      <pre>{{ patternACode }}</pre>

      <h4>Pattern B: Custom control (implements FormValueControl)</h4>
      <p>For fully custom UI. Implement <code>FormValueControl&lt;T&gt;</code> — only <code>value = model()</code> is required.
         Optional inputs like <code>errors</code>, <code>disabled</code>, <code>touched</code> are auto-bound.</p>
      <pre>{{ patternBCode }}</pre>

      <h4>Both patterns use the same layout API</h4>
      <pre>{{ layoutCode }}</pre>
    </section>
  `,
  styles: `
    .demo-section { margin-bottom: 24px; }
    .code-section h4 { margin: 16px 0 8px; }
    .code-section p { margin: 0 0 8px; color: #555; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 13px; overflow-x: auto; }
  `,
})
export class ControlsExampleComponent {
  private readonly model = signal<FeedbackForm>({
    name: '',
    email: '',
    rating: 0,
    comment: '',
  });

  protected readonly feedbackForm = form(this.model, (f) => {
    required(f.name);
    required(f.email);
    min(f.rating, 1);
  });

  protected readonly feedbackLayout = layout(this.feedbackForm, (f) => [
    group({
      name: control(f.name, { type: 'text', props: { label: 'Name' } }),
      email: control(f.email, { type: 'text', props: { label: 'Email', inputType: 'email' } }),
    }, { component: CardGroupComponent, props: { title: 'Your Info' } }),
    group({
      rating: control(f.rating, { component: RatingInputComponent, props: { label: 'How would you rate us?' } }),
      comment: control(f.comment, { type: 'textarea', props: { label: 'Comments', placeholder: 'Optional...' } }),
    }, { component: CardGroupComponent, props: { title: 'Feedback' } }),
  ]);

  protected readonly patternACode = `@Component({
  imports: [MatFormField, MatInput, FormField],
  template: \`
    <mat-form-field>
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formField]="field()" />
      <mat-error>{{ state().errors()[0]?.message }}</mat-error>
    </mat-form-field>
  \`,
})
export class TextInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly state = input.required<FieldState<string>>();
  readonly label = input('');
}`;

  protected readonly patternBCode = `@Component({
  template: \`
    <div class="stars">
      @for (star of [1,2,3,4,5]; track star) {
        <button [class.filled]="star <= value()"
                (click)="value.set(star)">
          {{ star <= value() ? '★' : '☆' }}
        </button>
      }
    </div>
  \`,
})
export class RatingInputComponent implements FormValueControl<number> {
  readonly value = model(0);          // required — two-way bound by FormField
  readonly errors = input([]);         // optional — auto-bound by FormField
  readonly touched = model(false);     // optional — auto-bound by FormField
  readonly label = input('');          // custom prop — passed from layout
}`;

  protected readonly layoutCode = `// Text input uses type registry (Pattern A — wraps Material)
control(f.name, { type: 'text', props: { label: 'Name' } })

// Rating uses direct component ref (Pattern B — custom control)
control(f.rating, { component: RatingInputComponent, props: { label: 'Rating' } })`;
}
