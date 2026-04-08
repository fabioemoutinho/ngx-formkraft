import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required } from '@angular/forms/signals';
import { FkFormComponent } from 'ngx-formkraft';
import type { FieldDefs } from 'ngx-formkraft';

interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-basic-example',
  standalone: true,
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Basic Example — Auto-render from FieldDefs</h3>
    <p>No explicit layout. Fields render in definition order using the type registry.</p>
    <form (ngSubmit)="onSubmit()">
      <fk-form [form]="loginForm" [fieldDefs]="fieldDefs" />
      <button type="submit">Submit</button>
    </form>
    <pre>Value: {{ loginForm().value() | json }}</pre>
  `,
})
export class BasicExampleComponent {
  private model = signal<LoginForm>({ username: '', password: '' });

  loginForm = form(this.model, (f) => {
    required(f.username);
    required(f.password);
  });

  fieldDefs: FieldDefs<LoginForm> = {
    username: { type: 'text', props: { label: 'Username', placeholder: 'Enter username' } },
    password: { type: 'text', props: { label: 'Password', inputType: 'password', placeholder: 'Enter password' } },
  };

  onSubmit() {
    console.log('Submitted:', this.loginForm().value());
  }
}
