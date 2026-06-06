import { Component, signal, inputBinding } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required } from '@angular/forms/signals';
import { SfrFormComponent, control, layout } from 'ngx-signal-forms-renderer';

interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-basic-example',
  imports: [SfrFormComponent, JsonPipe],
  template: `
    <h3>Basic Example</h3>
    <p>
      Define the form model, wire up validators, then describe how fields render using
      <code>layout()</code> and the type registry from <code>provideSignalFormsRenderer()</code>.
    </p>

    <section class="demo-section">
      <form (ngSubmit)="onSubmit()">
        <sfr-form [form]="loginForm" [layout]="loginLayout" />
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
      <h5>3. Describe the layout</h5>
      <pre>{{ codeLayout }}</pre>
      <h5>4. Render</h5>
      <pre>{{ codeTemplate }}</pre>
    </section>
  `,
  styles: `
    .demo-section {
      margin-bottom: 24px;
    }
    .code-section h5 {
      margin: 12px 0 4px;
      color: #555;
    }
    pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      overflow-x: auto;
    }
    button {
      margin-top: 8px;
      padding: 8px 24px;
    }
  `,
})
export class BasicExampleComponent {
  private readonly model = signal<LoginForm>({ username: '', password: '' });

  protected readonly loginForm = form(this.model, (f) => {
    required(f.username);
    required(f.password);
  });

  protected readonly loginLayout = layout(this.loginForm, (f) => [
    control(f.username, {
      type: 'text',
      bindings: [inputBinding('label', () => 'Username'), inputBinding('placeholder', () => 'Enter username')],
    }),
    control(f.password, {
      type: 'text',
      bindings: [
        inputBinding('label', () => 'Password'),
        inputBinding('inputType', () => 'password'),
        inputBinding('placeholder', () => 'Enter password'),
      ],
    }),
  ]);

  protected onSubmit(): void {
    alert(`Submitted: ${JSON.stringify(this.loginForm().value())}`);
  }

  protected readonly codeProvider = `// app.config.ts
provideSignalFormsRenderer({
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

  protected readonly codeLayout = `loginLayout = layout(loginForm, (f) => [
  control(f.username, { type: 'text', props: { label: 'Username' } }),
  control(f.password, { type: 'text', props: { label: 'Password', inputType: 'password' } }),
]);`;

  protected readonly codeTemplate = `<sfr-form [form]="loginForm" [layout]="loginLayout" />`;
}
