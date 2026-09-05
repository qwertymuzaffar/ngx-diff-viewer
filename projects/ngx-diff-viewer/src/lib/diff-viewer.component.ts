import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { diffLines, diffStats, toSideBySide } from './diff';

export type DiffViewMode = 'side-by-side' | 'inline';

/**
 * Text diff viewer with side-by-side and inline modes.
 * The diff is computed from the `oldText`/`newText` inputs - no
 * external diff library required. Themeable via CSS custom properties.
 */
@Component({
  selector: 'ngx-diff-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './diff-viewer.component.html',
  styleUrl: './diff-viewer.component.scss',
})
export class DiffViewerComponent {
  oldText = input.required<string>();
  newText = input.required<string>();
  mode = input<DiffViewMode>('side-by-side');
  /** Optional file labels shown in the header. */
  oldLabel = input('before');
  newLabel = input('after');
  /** Hide the header bar (labels + stats). */
  hideHeader = input(false);

  readonly lines = computed(() => diffLines(this.oldText(), this.newText()));
  readonly rows = computed(() => toSideBySide(this.lines()));
  readonly stats = computed(() => diffStats(this.lines()));
  readonly hasChanges = computed(
    () => this.stats().additions > 0 || this.stats().deletions > 0,
  );
}
