import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbar, MatAnchor],
  template: `
    <mat-toolbar color="primary">
      <span>ngx-formkraft</span>
    </mat-toolbar>
    <nav>
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Basic</a>
      <a mat-button routerLink="/layout" routerLinkActive="active">Layout + Groups</a>
      <a mat-button routerLink="/composable" routerLinkActive="active">Composable</a>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: `
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
      max-width: 800px;
    }
    pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      overflow-x: auto;
    }
  `,
})
export class App {
  title = 'ngx-formkraft demo';
}
