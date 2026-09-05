# ngx-diff-viewer

Text diff viewer component for Angular - side-by-side and inline modes with a built-in LCS line diff. Zero runtime dependencies, themeable via CSS custom properties.

## Features

- **Built-in diff** - classic LCS line diff computed from `oldText`/`newText`; no external diff library
- **Two modes** - GitHub-style `side-by-side` (change blocks aligned into rows) and unified `inline` with +/- gutters
- **Stats header** - +additions / -deletions, optional (`hideHeader`)
- **Signals API** - `input()` based, `OnPush`, recomputes on any input change
- **Themeable** - all colors/fonts are `--ndv-*` CSS custom properties (dark theme included in Storybook)
- **Tested** - 100% statement coverage on the diff engine and component

## Install

```bash
npm install ngx-diff-viewer
```

## Usage

```ts
import { DiffViewerComponent } from 'ngx-diff-viewer';

@Component({
  imports: [DiffViewerComponent],
  template: `
    <ngx-diff-viewer
      [oldText]="before"
      [newText]="after"
      mode="side-by-side"
      oldLabel="v1.ts"
      newLabel="v2.ts"
    />`,
})
export class ReviewPage {
  before = 'line 1\nline 2';
  after = 'line 1\nline 2 changed';
}
```

The diff engine is also exported standalone:

```ts
import { diffLines, diffStats, toSideBySide } from 'ngx-diff-viewer';

const lines = diffLines(before, after);   // DiffLine[] with ops + line numbers
const stats = diffStats(lines);           // { additions, deletions, unchanged }
```

## API

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `oldText` | `string` | required | Left/original text |
| `newText` | `string` | required | Right/updated text |
| `mode` | `'side-by-side' \| 'inline'` | `'side-by-side'` | View mode |
| `oldLabel` / `newLabel` | `string` | `before` / `after` | Header labels |
| `hideHeader` | `boolean` | `false` | Hide the labels/stats bar |

### Theming

```css
ngx-diff-viewer {
  --ndv-bg: #0d1117;
  --ndv-ink: #c9d1d9;
  --ndv-add-bg: #12261e;
  --ndv-del-bg: #2d1215;
}
```

Full list in `diff-viewer.component.scss`.

## Development

```bash
npm start                        # demo app
ng test ngx-diff-viewer          # unit tests (vitest)
ng run demo:storybook            # storybook
```

Requires Node 22+ and Angular 19+.

## License

MIT
