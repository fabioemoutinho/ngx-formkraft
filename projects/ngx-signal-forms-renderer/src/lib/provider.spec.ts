import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideSignalFormsRenderer, SIGNAL_FORMS_RENDERER_TYPE_REGISTRY, SignalFormsRendererTypeRegistry } from './provider';

describe('provideSignalFormsRenderer()', () => {
  it('should provide the type registry', () => {
    class TextComp {}
    class SelectComp {}

    TestBed.configureTestingModule({
      providers: [
        provideSignalFormsRenderer({
          types: {
            text: TextComp as any,
            select: SelectComp as any,
          },
        }),
      ],
    });

    const registry = TestBed.inject(SIGNAL_FORMS_RENDERER_TYPE_REGISTRY);
    expect(registry['text']).toBe(TextComp);
    expect(registry['select']).toBe(SelectComp);
  });

  it('should provide empty registry when no types given', () => {
    TestBed.configureTestingModule({
      providers: [provideSignalFormsRenderer()],
    });

    const registry = TestBed.inject(SIGNAL_FORMS_RENDERER_TYPE_REGISTRY);
    expect(registry).toEqual({});
  });

  it('should provide empty registry when config is empty', () => {
    TestBed.configureTestingModule({
      providers: [provideSignalFormsRenderer({})],
    });

    const registry = TestBed.inject(SIGNAL_FORMS_RENDERER_TYPE_REGISTRY);
    expect(registry).toEqual({});
  });
});
