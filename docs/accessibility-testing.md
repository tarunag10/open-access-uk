# Accessibility Testing

Automated checks are useful but not enough. Open Access UK targets WCAG 2.2 AA.

## Automated

```sh
npm run test:a11y
npm run lighthouse
```

The axe gate should have no serious or critical violations.
The Lighthouse gate keeps the homepage accessibility score at or above 0.95.

## Manual Matrix

- Keyboard-only navigation.
- VoiceOver on macOS or iOS.
- NVDA on Windows.
- Browser zoom to 200%.
- 360px mobile viewport.
- High-contrast or forced-colours mode.
- Reduced-motion preference.

## Manual Checklist

- Skip link reaches the main landmark.
- Mobile nav is reachable and exposes expanded/collapsed state.
- Workflow state is announced.
- Focus order follows the visual order.
- Copy-token feedback is announced through a live region.
- Tool links are real links and do not look like inert controls.
