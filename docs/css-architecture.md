# CSS Architecture

## Two Theming "Brands"

The suite uses two visual themes built on shared CSS custom properties:

| Theme | Used by | Visual style | Max width | Radii | Accent |
|-------|---------|-------------|-----------|-------|--------|
| **Claude** (default) | 14 Phase 1–4 tools | Warm serif, rounded, editorial | 1180px | 8/14/22px | Orange (#c2410c) |
| **Suite-skin** | foi-tracker, case-builder, site | Gov-tech, sans-serif, compact | 1320px | 4/6/8px | Red (#cf1f1f) |

## Shared CSS files (`shared/claude/`)

These are the canonical source of truth:

| File | Contents | Lines |
|------|----------|-------|
| `tokens.css` | Design tokens: colours, fonts, spacing, shadows, radii, dark theme | ~145 |
| `components.css` | Layout, header, nav, buttons, cards, forms, hero, footer, tags, code windows, meter, toast | ~195 |
| `motion.css` | Reveal animations, card hover, `prefers-reduced-motion` | ~40 |
| `print.css` | Print/PDF: hide nav/footer/actions, flatten colours, show link URLs | ~25 |

Additionally:
- `shared/suite-skin.css` (~230 lines) overrides Claude tokens for the gov-tech brand

## Per-tool `styles.css` — current pattern

Every tool inlines all shared CSS at the top of its `styles.css`, then appends tool-specific rules. For a typical Phase tool:

```
 [shared/claude/tokens.css]          ~145 lines
 [shared/claude/components.css]      ~195 lines
 [shared/claude/motion.css]          ~40  lines
 [shared/claude/print.css]           ~25  lines
 [tool-specific overrides]            varies (~200–500 lines)
```

For suite-skinned tools (foi-tracker, case-builder), the suite-skin is inlined first, then the Claude files are overlaid.

## How to maintain

**If you change a shared CSS file**, you **must** update every tool's `styles.css` to match. The same divergence risk that existed for `app.js` (audit finding D4) exists for CSS.

Long-term fix: consolidate shared CSS into separate files served via `<link>` tags, with per-tool `styles.css` containing only overrides. This would eliminate ~400 lines of duplication per tool.

## Best practices for tool-specific styles

1. Use CSS custom properties from `tokens.css` (`var(--ink)`, `var(--surface)`, `var(--space-4)`, `var(--radius-md)`, etc.)
2. Keep tool-specific selectors scoped to the tool's component classes
3. Avoid overriding shared component styles — add new classes instead
4. Test both light and dark themes
5. Ensure hover, focus, and active states are styled
6. Add print styles for generated letters and results
