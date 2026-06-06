import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FieldTree } from '@angular/forms/signals';
import { SfrFormComponent, control, group, array, layout } from 'ngx-signal-forms-renderer';
import { CardGroupComponent } from '../components/card-group.component';
import { SortableListComponent } from '../components/sortable-list.component';

interface BudgetItem {
  name: string;
  amount: string;
}

interface BudgetForm {
  items: BudgetItem[];
}

function budgetItemLayout(item: FieldTree<BudgetItem>) {
  return group(item, { component: CardGroupComponent }, (g) => ({
    name: control(g.name, { type: 'text', props: { label: 'Name' } }),
    amount: control(g.amount, { type: 'text', props: { label: 'Amount ($)' } }),
  }));
}

@Component({
  selector: 'app-dynamic-array-example',
  imports: [SfrFormComponent, JsonPipe],
  template: `
    <h3>Dynamic Array — Reactive layout from signal array</h3>
    <p>
      Type in a field, then click ↑ or ↓ to reorder. The typed text moves with the item
      because signal forms tracks identity, not position.
    </p>

    <section class="demo-section">
      <sfr-form [form]="budgetForm" [layout]="budgetLayout" />

      <div class="actions">
        <button (click)="addItem()">+ Add Item</button>
        <button (click)="removeItem()" [disabled]="budgetForm().value().items.length <= 1">− Remove Last</button>
      </div>

      <p class="total">Total: $ {{ total() }}</p>
      <pre>Value: {{ budgetForm().value() | json }}</pre>
    </section>

    <section class="code-section">
      <h4>How it works</h4>
      <pre>{{ codeExample }}</pre>
    </section>
  `,
  styles: `
    .demo-section { margin-bottom: 24px; }
    .actions { display: flex; gap: 8px; margin: 16px 0; }
    .actions button { padding: 8px 16px; cursor: pointer; }
    .actions button:disabled { opacity: 0.5; cursor: default; }
    .total { font-weight: 500; font-size: 16px; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 13px; overflow-x: auto; }
    .code-section h4 { margin: 16px 0 8px; }
  `,
})
export class DynamicArrayExampleComponent {
  private readonly model = signal<BudgetForm>({
    items: [
      { name: 'Marketing', amount: '500' },
      { name: 'Operations', amount: '300' },
    ],
  });

  protected readonly budgetForm = form(this.model, () => {});

  protected readonly total = computed(() =>
    this.budgetForm().value().items
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      .toFixed(2)
  );

  protected readonly budgetLayout = layout(this.budgetForm, (f) => [
    array(f.items, { component: SortableListComponent, props: { onMove: (from: number, to: number) => this.swap(from, to) } }, budgetItemLayout),
  ]);

  protected addItem(): void {
    this.model.update(m => ({
      ...m,
      items: [...m.items, { name: '', amount: '' }],
    }));
  }

  protected removeItem(): void {
    this.model.update(m => ({
      ...m,
      items: m.items.slice(0, -1),
    }));
  }

  protected swap(from: number, to: number): void {
    this.model.update(m => {
      const items = [...m.items];
      [items[from], items[to]] = [items[to], items[from]];
      return { ...m, items };
    });
  }

  protected readonly codeExample = `budgetLayout = layout(this.budgetForm, (f) => [
  array(
    f.items,
    { component: SortableListComponent, props: { onMove } },
    budgetItemLayout,
  ),
]);

// sfr-node iterates f.items via budgetItemLayout, passes LayoutNode[]
// to SortableListComponent as 'children'. @for (track node)
// moves components on reorder — no focus loss.`;
}
