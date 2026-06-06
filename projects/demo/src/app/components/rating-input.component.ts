import { Component, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-rating-input',
  imports: [],
  template: `
    <div class="rating-control">
      @if (label(); as l) {
        <label>{{ l }}</label>
      }
      <div class="stars">
        @for (star of stars; track star) {
          <button
            type="button"
            [class.filled]="star <= value()"
            [disabled]="disabled()"
            (click)="selectRating(star)">
            {{ star <= value() ? '★' : '☆' }}
          </button>
        }
      </div>
      @if (touched() && errors().length) {
        <span class="error">{{ errors()[0].message ?? errors()[0].kind }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .rating-control { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-size: 14px; color: rgba(0,0,0,.6); }
    .stars { display: flex; gap: 4px; }
    .stars button { background: none; border: none; font-size: 24px; cursor: pointer; color: #ccc; padding: 0; }
    .stars button.filled { color: #ffc107; }
    .stars button:disabled { cursor: not-allowed; opacity: 0.5; }
    .error { color: #f44336; font-size: 12px; margin-top: 4px; display: block; }
  `,
})
export class RatingInputComponent implements FormValueControl<number> {
  readonly value = model(0);
  readonly label = input('');
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly touched = model(false);

  protected readonly stars = [1, 2, 3, 4, 5];

  protected selectRating(star: number): void {
    this.value.set(star);
    this.touched.set(true);
  }
}
