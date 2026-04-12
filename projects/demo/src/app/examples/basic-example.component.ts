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
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Basic Example — Auto-render from FieldDefs</h3>
    <p>No explicit layout needed. Fields render in definition order using the type registry configured in <code>provideFormKraft()</code>.</p>

    <section class="demo-section">
      <form (ngSubmit)="onSubmit()">
        <fk-form [form]="loginForm" [fieldDefs]="fieldDefs" />
        <button type="submit">Submit</button>
      </form>
      <pre>Value: {{ loginForm().value() | json }}</pre>
    </section>

    <section class="code-section">
      <h4>How it works</h4>
      <h5>1. Register control components globally</h5>
      <pre>{{ codeProvider }}</pre>
      <h5>2. Define the signal form</h5>
      <pre>{{ codeForm }}</pre>
      <h5>3. Map fields to renderers</h5>
      <pre>{{ codeDefs }}</pre>
      <h5>4. Render</h5>
      <pre>{{ codeTemplate }}</pre>
    </section>
  `,
  styles: `
    .demo-section { margin-bottom: 24px; }
    .code-section h5 { margin: 12px 0 4px; color: #555; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 13px; overflow-x: auto; }
    button { margin-top: 8px; padding: 8px 24px; }
  `,
})
export class BasicExampleComponent {
  private readonly model = signal<LoginForm>({ username: '', password: '' });

  protected readonly loginForm = form(this.model, (f) => {
    required(f.username);
    required(f.password);
  });

  protected readonly fieldDefs: FieldDefs<LoginForm> = {
    username: { type: 'text', props: { label: 'Username', placeholder: 'Enter username' } },
    password: { type: 'text', props: { label: 'Password', inputType: 'password', placeholder: 'Enter password' } },
  };

  protected onSubmit(): void {
    alert(`Submitted: ${JSON.stringify(this.loginForm().value())}`);
  }

  protected readonly codeProvider = `// app.config.ts
provideFormKraft({
  types: {
    text: TextInputComponent,
    select: SelectInputComponent,
    textarea: TextareaInputComponent,
  }
})`;

  protected readonly codeForm = `model = signal<LoginForm>({ username: '', password: '' });

loginForm = form(this.model, (f) => {
  required(f.username);
  required(f.password);
});`;

  protected readonly codeDefs = `fieldDefs: FieldDefs<LoginForm> = {
  username: { type: 'text', props: { label: 'Username' } },
  password: { type: 'text', props: { label: 'Password', inputType: 'password' } },
};`;

  protected readonly codeTemplate = `<fk-form [form]="loginForm" [fieldDefs]="fieldDefs" />`;
}
