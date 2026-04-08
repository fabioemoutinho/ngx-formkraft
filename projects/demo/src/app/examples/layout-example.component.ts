import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required, email, hidden } from '@angular/forms/signals';
import { FkFormComponent, field, group, layout } from 'ngx-formkraft';
import type { FieldDefs } from 'ngx-formkraft';
import { CardGroupComponent } from '../components/card-group.component';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio: string;
}

@Component({
  selector: 'app-layout-example',
  standalone: true,
  imports: [FkFormComponent, JsonPipe],
  template: `
    <h3>Layout Example — Custom groups with CardComponent</h3>
    <p>Fields are organized into card groups. Bio is hidden when role is not "admin" (driven by signal forms <code>hidden()</code>).
       The entire "Details" group hides too via <code>hidden</code> signal on the group node.</p>
    <fk-form [form]="userForm" [layout]="userLayout" />
    <pre>Value: {{ userForm().value() | json }}</pre>
  `,
})
export class LayoutExampleComponent {
  private model = signal<UserProfile>({ name: '', email: '', role: 'user', bio: '' });

  userForm = form(this.model, (f) => {
    required(f.name);
    email(f.email);
    // Cross-field: hide bio when role is not 'admin' using valueOf to read role
    hidden(f.bio, ({ valueOf }) => valueOf(f.role) !== 'admin');
  });

  // Signal for group-level visibility — hides the entire Details card
  private isNotAdmin = computed(() => this.userForm.role().value() !== 'admin');

  userLayout = layout(this.userForm, (f) => [
    group('personal', { component: CardGroupComponent, props: { title: 'Personal Info' } }, [
      field(f.name, { type: 'text', props: { label: 'Full Name' } }),
      field(f.email, { type: 'text', props: { label: 'Email', inputType: 'email' } }),
      field(f.role, { type: 'select', props: { label: 'Role', options: ['user', 'editor', 'admin'] } }),
    ]),
    group('details', { component: CardGroupComponent, props: { title: 'Details' }, hidden: this.isNotAdmin }, [
      field(f.bio, { type: 'textarea', props: { label: 'Biography', placeholder: 'Tell us about yourself...' } }),
    ]),
  ]);
}
