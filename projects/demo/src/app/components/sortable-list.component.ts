import { Component, input } from '@angular/core';
import { FkNodeComponent, LayoutNode } from 'ngx-formkraft';

@Component({
  selector: 'app-sortable-list',
  imports: [FkNodeComponent],
  template: `
    @for (node of children(); track node; let i = $index; let count = $count) {
      <div class="item-row">
        <div class="sort-controls">
          <button (click)="onMove()(i, i - 1)" [disabled]="i === 0">↑</button>
          <button (click)="onMove()(i, i + 1)" [disabled]="i === count - 1">↓</button>
        </div>
        <fk-node [node]="node" />
      </div>
    }
  `,
  styles: `
    .item-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
    .sort-controls { display: flex; flex-direction: column; gap: 4px; padding-top: 16px; flex-shrink: 0; }
    .sort-controls button { width: 32px; height: 32px; cursor: pointer; font-size: 16px; border: 1px solid #ccc; background: #fff; border-radius: 4px; }
    .sort-controls button:disabled { opacity: 0.4; cursor: default; }
    .sort-controls button:not(:disabled):hover { background: #f5f5f5; }
    fk-node { flex: 1; min-width: 0; }
  `,
})
export class SortableListComponent {
  readonly children = input.required<LayoutNode[]>();
  readonly onMove = input.required<(from: number, to: number) => void>();
}
