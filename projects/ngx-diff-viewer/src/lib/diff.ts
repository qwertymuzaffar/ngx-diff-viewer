/** Line-level diff based on the classic LCS dynamic program. */

export type DiffOp = 'equal' | 'insert' | 'delete';

export interface DiffLine {
  op: DiffOp;
  /** 1-based line number in the old text; null for inserts. */
  oldLine: number | null;
  /** 1-based line number in the new text; null for deletes. */
  newLine: number | null;
  text: string;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
}

/** A side-by-side row: delete/insert pairs are aligned onto one row. */
export interface DiffRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

const splitLines = (text: string): string[] => (text === '' ? [] : text.split('\n'));

/**
 * Compute a line diff of two texts. O(n*m) LCS - fine for the
 * file-sized inputs a viewer component displays.
 */
export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = LCS length of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ op: 'equal', oldLine: i + 1, newLine: j + 1, text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ op: 'delete', oldLine: i + 1, newLine: null, text: a[i] });
      i++;
    } else {
      out.push({ op: 'insert', oldLine: null, newLine: j + 1, text: b[j] });
      j++;
    }
  }
  while (i < n) {
    out.push({ op: 'delete', oldLine: i + 1, newLine: null, text: a[i] });
    i++;
  }
  while (j < m) {
    out.push({ op: 'insert', oldLine: null, newLine: j + 1, text: b[j] });
    j++;
  }
  return out;
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return {
    additions: lines.filter((l) => l.op === 'insert').length,
    deletions: lines.filter((l) => l.op === 'delete').length,
    unchanged: lines.filter((l) => l.op === 'equal').length,
  };
}

/**
 * Align a linear diff into side-by-side rows: consecutive runs of
 * deletes and inserts are paired up (change blocks), like code review UIs.
 */
export function toSideBySide(lines: DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let k = 0;
  while (k < lines.length) {
    const line = lines[k];
    if (line.op === 'equal') {
      rows.push({ left: line, right: line });
      k++;
      continue;
    }
    // collect the whole change block
    const deletes: DiffLine[] = [];
    const inserts: DiffLine[] = [];
    while (k < lines.length && lines[k].op !== 'equal') {
      (lines[k].op === 'delete' ? deletes : inserts).push(lines[k]);
      k++;
    }
    const len = Math.max(deletes.length, inserts.length);
    for (let r = 0; r < len; r++) {
      rows.push({ left: deletes[r] ?? null, right: inserts[r] ?? null });
    }
  }
  return rows;
}
