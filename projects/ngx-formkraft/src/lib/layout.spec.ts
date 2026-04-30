import { describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { control, group, array, layout } from './layout';

// Minimal mock of FieldTree for testing builder functions
function mockFieldTree<T>(value: T): any {
  const state = {
    value: signal(value),
    hidden: signal(false),
    touched: signal(false),
    dirty: signal(false),
    disabled: signal(false),
    readonly: signal(false),
    required: signal(false),
    valid: signal(true),
    invalid: signal(false),
    pending: signal(false),
    errors: signal([]),
    errorSummary: signal([]),
    name: signal('test'),
    pattern: signal([]),
    submitting: signal(false),
    disabledReasons: signal([]),
    keyInParent: signal(''),
    formFieldBindings: signal([]),
    controlValue: signal(value),
    markAsTouched: () => {},
    markAsDirty: () => {},
    metadata: () => undefined,
    reset: () => {},
    focusBoundControl: () => {},
  };
  return Object.assign(() => state, {});
}

describe('control()', () => {
  it('should create a ControlNode with kind "control"', () => {
    const f = mockFieldTree('hello');
    const node = control(f);
    expect(node.kind).toBe('control');
    expect(node.field).toBe(f);
    expect(node.type).toBeUndefined();
    expect(node.component).toBeUndefined();
  });

  it('should create a ControlNode with options', () => {
    const f = mockFieldTree('hello');
    const node = control(f, { type: 'text', props: { label: 'Name' } });
    expect(node.kind).toBe('control');
    expect(node.type).toBe('text');
    expect(node.props?.['label']).toBe('Name');
  });

  it('should support component in options', () => {
    const f = mockFieldTree('');
    class MyComp {}
    const node = control(f, { component: MyComp as any });
    expect(node.component).toBe(MyComp);
  });
});

describe('group()', () => {
  it('should create a GroupNode with keyed children', () => {
    const f1 = mockFieldTree('a');
    const f2 = mockFieldTree('b');
    const node = group('test', { a: control(f1), b: control(f2) });
    expect(node.kind).toBe('group');
    expect(node.name).toBe('test');
    expect(Object.keys(node.children)).toEqual(['a', 'b']);
    expect(node.component).toBeUndefined();
  });

  it('should create a GroupNode with options and keyed children', () => {
    class CardComp {}
    const node = group('test', { component: CardComp as any, props: { title: 'Hello' } }, {});
    expect(node.kind).toBe('group');
    expect(node.component).toBe(CardComp);
    expect(node.props?.['title']).toBe('Hello');
    expect(Object.keys(node.children)).toEqual([]);
  });

  it('should support type string for registry resolution', () => {
    const node = group('test', { type: 'card' }, {});
    expect(node.type).toBe('card');
    expect(node.component).toBeUndefined();
  });

  it('should support hidden signal', () => {
    const hiddenSig = signal(true);
    const node = group('test', { hidden: hiddenSig }, {});
    expect(node.hidden).toBe(hiddenSig);
    expect(node.hidden!()).toBe(true);
  });
});

describe('array()', () => {
  it('should create an ArrayNode with ordered children', () => {
    const f1 = mockFieldTree('a');
    const f2 = mockFieldTree('b');
    const node = array('steps', [control(f1), control(f2)]);
    expect(node.kind).toBe('array');
    expect(node.name).toBe('steps');
    expect(node.children.length).toBe(2);
  });

  it('should create an ArrayNode with options and children', () => {
    class StepperComp {}
    const f = mockFieldTree('a');
    const node = array('steps', { component: StepperComp as any }, [control(f)]);
    expect(node.kind).toBe('array');
    expect(node.component).toBe(StepperComp);
    expect(node.children.length).toBe(1);
  });

  it('should support type string', () => {
    const node = array('steps', { type: 'stepper' }, []);
    expect(node.type).toBe('stepper');
  });

  it('should support hidden signal', () => {
    const hiddenSig = signal(false);
    const node = array('steps', { hidden: hiddenSig }, []);
    expect(node.hidden).toBe(hiddenSig);
  });
});

describe('layout()', () => {
  it('should return a function that calls fn with the form ref', () => {
    const f = mockFieldTree({ name: '' });
    const layoutFn = layout(f, (form) => [
      control(form),
    ]);
    expect(typeof layoutFn).toBe('function');
    const nodes = layoutFn();
    expect(nodes.length).toBe(1);
    expect(nodes[0].kind).toBe('control');
  });

  it('should return consistent results on multiple calls', () => {
    const f = mockFieldTree({ name: '' });
    const layoutFn = layout(f, () => [
      group('g', {}),
    ]);
    const r1 = layoutFn();
    const r2 = layoutFn();
    expect(r1.length).toBe(1);
    expect(r2.length).toBe(1);
    expect(r1[0].kind).toBe('group');
  });
});

describe('component resolution', () => {
  it('control type is set correctly for registry resolution', () => {
    const f = mockFieldTree('');
    const node = control(f, { type: 'text' });
    expect(node.type).toBe('text');
  });

  it('control component is set correctly', () => {
    class CustomComp {}
    const f = mockFieldTree('');
    const node = control(f, { component: CustomComp as any });
    expect(node.component).toBe(CustomComp);
  });
});
