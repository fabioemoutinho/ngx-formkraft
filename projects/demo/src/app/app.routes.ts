import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./examples/basic-example.component').then(m => m.BasicExampleComponent),
  },
  {
    path: 'layout',
    loadComponent: () => import('./examples/layout-example.component').then(m => m.LayoutExampleComponent),
  },
  {
    path: 'composable',
    loadComponent: () => import('./examples/composable-example.component').then(m => m.ComposableExampleComponent),
  },
  {
    path: 'controls',
    loadComponent: () => import('./examples/controls-example.component').then(m => m.ControlsExampleComponent),
  },
  {
    path: 'dynamic-array',
    loadComponent: () => import('./examples/dynamic-array-example.component').then(m => m.DynamicArrayExampleComponent),
  },
];
