import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiffViewerComponent, type DiffViewMode } from './diff-viewer.component';

@Component({
  imports: [DiffViewerComponent],
  template: `<ngx-diff-viewer
    [oldText]="oldText"
    [newText]="newText"
    [mode]="mode"
    [oldLabel]="'v1.ts'"
    [newLabel]="'v2.ts'"
    [hideHeader]="hideHeader"
  />`,
})
class HostComponent {
  oldText = 'a\nold\nc';
  newText = 'a\nnew\nc';
  mode: DiffViewMode = 'side-by-side';
  hideHeader = false;
}

describe('DiffViewerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  /** Inputs are applied before the first change detection. */
  function createHost(overrides: Partial<HostComponent> = {}): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return fixture;
  }

  const el = (f: ComponentFixture<HostComponent>): HTMLElement => f.nativeElement;

  it('renders the header with labels and +/- stats', () => {
    const f = createHost();
    expect(el(f).querySelector('.ndv-labels')?.textContent).toContain('v1.ts → v2.ts');
    expect(el(f).querySelector('.ndv-stat-add')?.textContent).toBe('+1');
    expect(el(f).querySelector('.ndv-stat-del')?.textContent).toBe('-1');
  });

  it('hides the header when hideHeader is set', () => {
    const f = createHost({ hideHeader: true });
    expect(el(f).querySelector('.ndv-header')).toBeNull();
  });

  it('renders side-by-side rows with delete left and insert right', () => {
    const f = createHost();
    const rows = el(f).querySelectorAll('.ndv-split .ndv-row');
    expect(rows).toHaveLength(3);
    const changed = rows[1];
    expect(changed.children[0].classList).toContain('ndv-delete');
    expect(changed.children[0].textContent).toContain('old');
    expect(changed.children[1].classList).toContain('ndv-insert');
    expect(changed.children[1].textContent).toContain('new');
  });

  it('renders inline mode with +/- signs', () => {
    const f = createHost({ mode: 'inline' });
    expect(el(f).querySelector('.ndv-split')).toBeNull();
    const cells = el(f).querySelectorAll('.ndv-inline .ndv-cell');
    expect(cells).toHaveLength(4); // a, -old, +new, c
    const signs = Array.from(el(f).querySelectorAll('.ndv-sign')).map((s) => s.textContent);
    expect(signs).toEqual([' ', '-', '+', ' ']);
  });

  it('shows "no changes" when texts are identical', () => {
    const f = createHost({ newText: 'a\nold\nc' });
    expect(el(f).querySelector('.ndv-stat-same')?.textContent).toContain('no changes');
    expect(el(f).querySelector('.ndv-stat-add')?.textContent).toBe('+0');
  });

  it('counts multiple additions', () => {
    const f = createHost({ newText: 'a\nnew\nc\nextra' });
    expect(el(f).querySelector('.ndv-stat-add')?.textContent).toBe('+2');
  });

  it('renders blank filler cells for unbalanced change blocks', () => {
    const f = createHost({ oldText: 'a\nb', newText: 'a\nx\ny\nb' });
    expect(el(f).querySelectorAll('.ndv-blank').length).toBeGreaterThan(0);
  });
});
