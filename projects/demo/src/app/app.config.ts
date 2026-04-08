import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFormKraft } from 'ngx-formkraft';
import { routes } from './app.routes';
import { TextInputComponent } from './components/text-input.component';
import { SelectInputComponent } from './components/select-input.component';
import { TextareaInputComponent } from './components/textarea-input.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFormKraft({
      types: {
        text: TextInputComponent,
        select: SelectInputComponent,
        textarea: TextareaInputComponent,
      },
    }),
  ],
};
