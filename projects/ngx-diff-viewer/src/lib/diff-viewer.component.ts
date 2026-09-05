import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  diffLines,
  diffStats,
  intraline,
  toSideBySide,
  type DiffRow,
  type IntralinePair,
} from './diff';

export type DiffViewMode = 'side-by-side' | 'inline';

export interface RenderRow extends DiffRow {
  /** Char-level segments when the row is a delete/insert pair. */
  segments: IntralinePair | null;
}

/**
 * Text diff viewer with side-by-side and inline modes.
 * The diff is computed from the `oldText`/`newText` inputs - no
 * external diff library required. Replaced line pairs get char-level
 * intra-line highlighting. Themeable via CSS custom properties.
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
  /** Disable char-level highlighting inside replaced lines. */
  disableIntraline = input(false);

  readonly lines = computed(() => diffLines(this.oldText(), this.newText()));
  readonly stats = computed(() => diffStats(this.lines()));
  readonly hasChanges = computed(
    () => this.stats().additions > 0 || this.stats().deletions > 0,
  );

  readonly rows = computed<RenderRow[]>(() =>
    toSideBySide(this.lines()).map((row) => ({
      ...row,
      segments:
        !this.disableIntraline() && row.left?.op === 'delete' && row.right?.op === 'insert'
          ? intraline(row.left.text, row.right.text)
          : null,
    })),
  );
}
