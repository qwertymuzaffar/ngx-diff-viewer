import { diffLines, diffStats, intraline, toSideBySide, type DiffLine } from './diff';

const ops = (lines: DiffLine[]) => lines.map((l) => `${l.op[0]}:${l.text}`);

describe('diffLines', () => {
  it('marks identical texts as all-equal', () => {
    const d = diffLines('a\nb\nc', 'a\nb\nc');
    expect(d.every((l) => l.op === 'equal')).toBe(true);
    expect(d).toHaveLength(3);
  });

  it('handles pure insertion', () => {
    const d = diffLines('a\nc', 'a\nb\nc');
    expect(ops(d)).toEqual(['e:a', 'i:b', 'e:c']);
    expect(d[1]).toEqual({ op: 'insert', oldLine: null, newLine: 2, text: 'b' });
  });

  it('handles pure deletion', () => {
    const d = diffLines('a\nb\nc', 'a\nc');
    expect(ops(d)).toEqual(['e:a', 'd:b', 'e:c']);
    expect(d[1]).toEqual({ op: 'delete', oldLine: 2, newLine: null, text: 'b' });
  });

  it('handles replacement as delete + insert', () => {
    const d = diffLines('a\nold\nc', 'a\nnew\nc');
    expect(ops(d)).toEqual(['e:a', 'd:old', 'i:new', 'e:c']);
  });

  it('tracks 1-based line numbers on both sides', () => {
    const d = diffLines('x\ny', 'y\nz');
    // x deleted, y kept, z inserted
    expect(d).toEqual([
      { op: 'delete', oldLine: 1, newLine: null, text: 'x' },
      { op: 'equal', oldLine: 2, newLine: 1, text: 'y' },
      { op: 'insert', oldLine: null, newLine: 2, text: 'z' },
    ]);
  });

  it('handles empty old text (everything inserted)', () => {
    const d = diffLines('', 'a\nb');
    expect(ops(d)).toEqual(['i:a', 'i:b']);
  });

  it('handles empty new text (everything deleted)', () => {
    const d = diffLines('a\nb', '');
    expect(ops(d)).toEqual(['d:a', 'd:b']);
  });

  it('handles both texts empty', () => {
    expect(diffLines('', '')).toEqual([]);
  });

  it('does not conflate repeated lines', () => {
    const d = diffLines('a\na\nb', 'a\nb');
    expect(d.filter((l) => l.op === 'delete')).toHaveLength(1);
    expect(d.filter((l) => l.op === 'equal')).toHaveLength(2);
  });
});

describe('diffStats', () => {
  it('counts additions, deletions, and unchanged lines', () => {
    const stats = diffStats(diffLines('a\nold\nc', 'a\nnew\nc\nd'));
    expect(stats).toEqual({ additions: 2, deletions: 1, unchanged: 2 });
  });
});

describe('toSideBySide', () => {
  it('mirrors equal lines onto both sides', () => {
    const rows = toSideBySide(diffLines('a', 'a'));
    expect(rows).toHaveLength(1);
    expect(rows[0].left?.text).toBe('a');
    expect(rows[0].right?.text).toBe('a');
  });

  it('pairs a replacement onto one row', () => {
    const rows = toSideBySide(diffLines('a\nold\nc', 'a\nnew\nc'));
    expect(rows).toHaveLength(3);
    expect(rows[1].left?.op).toBe('delete');
    expect(rows[1].right?.op).toBe('insert');
  });

  it('pads unbalanced change blocks with nulls', () => {
    const rows = toSideBySide(diffLines('a\nx\nb', 'a\nn1\nn2\nn3\nb'));
    const changeRows = rows.filter((r) => r.left?.op !== 'equal');
    expect(changeRows).toHaveLength(3);
    expect(changeRows[0].left?.op).toBe('delete');
    expect(changeRows[1].left).toBeNull();
    expect(changeRows[2].left).toBeNull();
    expect(changeRows.every((r) => r.right?.op === 'insert')).toBe(true);
  });
});

describe('intraline', () => {
  it('marks only the changed middle of similar lines', () => {
    const { left, right } = intraline('const value = 1;', 'const value = 42;');
    expect(left.filter((s) => s.changed).map((s) => s.text)).toEqual(['1']);
    expect(right.filter((s) => s.changed).map((s) => s.text)).toEqual(['42']);
    expect(left.map((s) => s.text).join('')).toBe('const value = 1;');
    expect(right.map((s) => s.text).join('')).toBe('const value = 42;');
  });

  it('marks everything changed for disjoint strings', () => {
    const { left, right } = intraline('aaa', 'zzz');
    expect(left).toEqual([{ text: 'aaa', changed: true }]);
    expect(right).toEqual([{ text: 'zzz', changed: true }]);
  });

  it('marks nothing changed for identical strings', () => {
    const { left, right } = intraline('same', 'same');
    expect(left).toEqual([{ text: 'same', changed: false }]);
    expect(right).toEqual([{ text: 'same', changed: false }]);
  });

  it('merges consecutive changed chars into one segment', () => {
    const { right } = intraline('ab', 'aXYb');
    expect(right).toEqual([
      { text: 'a', changed: false },
      { text: 'XY', changed: true },
      { text: 'b', changed: false },
    ]);
  });

  it('falls back to whole-line change above the length limit', () => {
    const long = 'x'.repeat(500);
    const { left } = intraline(long, 'y' + long);
    expect(left).toEqual([{ text: long, changed: true }]);
  });

  it('handles empty sides', () => {
    expect(intraline('', 'new').right).toEqual([{ text: 'new', changed: true }]);
    expect(intraline('', 'new').left).toEqual([]);
  });
});

