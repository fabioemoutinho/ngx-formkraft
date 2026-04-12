import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideFormKraft, FORMKRAFT_TYPE_REGISTRY, FormKraftTypeRegistry } from './provider';

describe('provideFormKraft()', () => {
  it('should provide the type registry', () => {
    class TextComp {}
    class SelectComp {}

    TestBed.configureTestingModule({
      providers: [
        provideFormKraft({
          types: {
            text: TextComp as any,
            select: SelectComp as any,
          },
        }),
      ],
    });

    const registry = TestBed.inject(FORMKRAFT_TYPE_REGISTRY);
    expect(registry['text']).toBe(TextComp);
    expect(registry['select']).toBe(SelectComp);
  });

  it('should provide empty registry when no types given', () => {
    TestBed.configureTestingModule({
      providers: [provideFormKraft()],
    });

    const registry = TestBed.inject(FORMKRAFT_TYPE_REGISTRY);
    expect(registry).toEqual({});
  });

  it('should provide empty registry when config is empty', () => {
    TestBed.configureTestingModule({
      providers: [provideFormKraft({})],
    });

    const registry = TestBed.inject(FORMKRAFT_TYPE_REGISTRY);
    expect(registry).toEqual({});
  });
});
