import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbar, MatAnchor],
  template: `
    <mat-toolbar color="primary">
      <span>ngx-formkraft</span>
      <span class="spacer"></span>
      <a mat-button href="https://github.com/fabioemoutinho/ngx-formkraft" target="_blank">GitHub</a>
    </mat-toolbar>
    <nav>
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Basic</a>
      <a mat-button routerLink="/layout" routerLinkActive="active">Layout + Groups</a>
      <a mat-button routerLink="/composable" routerLinkActive="active">Composable</a>
      <a mat-button routerLink="/controls" routerLinkActive="active">Control Patterns</a>
      <a mat-button routerLink="/dynamic-array" routerLinkActive="active">Dynamic Array</a>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: `
    .spacer { flex: 1; }
    nav {
      display: flex;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    nav a.active {
      background: rgba(0, 0, 0, 0.08);
    }
    main {
      padding: 24px;
      max-width: 900px;
    }
  `,
})
export class App {
}
