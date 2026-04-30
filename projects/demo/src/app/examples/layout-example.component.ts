import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required, email, hidden } from '@angular/forms/signals';
import { FkFormComponent, control, group, layout } from 'ngx-formkraft';
import { CardGroupComponent } from '../components/card-group.component';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio: string;
}

@Component({
  selector: 'app-layout-example',
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Layout Example — Custom groups with CardComponent</h3>
    <p>Fields are organized into card groups using <code>group()</code> with a custom <code>CardGroupComponent</code>.
       The "Details" section hides entirely when role is not "admin" — demonstrating both
       signal forms <code>hidden()</code> (field-level) and group <code>hidden</code> signal (layout-level).</p>

    <section class="demo-section">
      <fk-form [form]="userForm" [layout]="userLayout" />
      <pre>Value: {{ userForm().value() | json }}</pre>
      <p><em>Try selecting "admin" in the Role dropdown to reveal the Details section.</em></p>
    </section>

    <section class="code-section">
      <h4>Key concepts</h4>
      <h5>Layout with groups</h5>
      <pre>{{ codeLayout }}</pre>
      <h5>Field visibility via signal forms</h5>
      <pre>{{ codeHidden }}</pre>
      <h5>Group visibility via Signal</h5>
      <pre>{{ codeGroupHidden }}</pre>
    </section>
  `,
  styles: `
    .demo-section { margin-bottom: 24px; }
    .code-section h5 { margin: 12px 0 4px; color: #555; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 13px; overflow-x: auto; }
    em { color: #666; }
  `,
})
export class LayoutExampleComponent {
  private readonly model = signal<UserProfile>({ name: '', email: '', role: 'user', bio: '' });

  protected readonly userForm = form(this.model, (f) => {
    required(f.name);
    email(f.email);
    hidden(f.bio, ({ valueOf }) => valueOf(f.role) !== 'admin');
  });

  private readonly isNotAdmin = computed(() => this.userForm.role().value() !== 'admin');

  protected readonly userLayout = layout(this.userForm, (f) => [
    group('personal', { component: CardGroupComponent, props: { title: 'Personal Info' } }, {
      name: control(f.name, { type: 'text', props: { label: 'Full Name' } }),
      email: control(f.email, { type: 'text', props: { label: 'Email', inputType: 'email' } }),
      role: control(f.role, { type: 'select', props: { label: 'Role', options: ['user', 'editor', 'admin'] } }),
    }),
    group('details', { component: CardGroupComponent, props: { title: 'Details' }, hidden: this.isNotAdmin }, {
      bio: control(f.bio, { type: 'textarea', props: { label: 'Biography', placeholder: 'Tell us about yourself...' } }),
    }),
  ]);

  protected readonly codeLayout = `userLayout = layout(this.userForm, (f) => [
  group('personal', { component: CardGroupComponent, props: { title: 'Personal Info' } }, {
    name: control(f.name, { type: 'text', props: { label: 'Full Name' } }),
    role: control(f.role, { type: 'select', props: { label: 'Role', options: [...] } }),
  }),
  group('details', { component: CardGroupComponent, hidden: this.isNotAdmin }, {
    bio: control(f.bio, { type: 'textarea' }),
  }),
]);`;

  protected readonly codeHidden = `// In the schema — cross-field reference using valueOf()
hidden(f.bio, ({ valueOf }) => valueOf(f.role) !== 'admin');`;

  protected readonly codeGroupHidden = `// Layout-level — hides the entire card wrapper
private isNotAdmin = computed(() => this.userForm.role().value() !== 'admin');
group('details', { hidden: this.isNotAdmin }, { bio: control(f.bio) });`;
}
