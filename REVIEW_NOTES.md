# Review Notes

## 2026-05-09

Resolved items from project review:

- Fixed: `pnpm exec tsc --noEmit` failed while `next.config.mjs` skipped TypeScript and ESLint during `pnpm build`.
- Fixed: `hooks/useMarkdownToOutline.ts` rejected any content containing `#` without a Markdown heading line.
- Fixed: `hooks/useServiceWorker.ts` started an hourly update interval without clearing it in effect cleanup.
- Fixed: Several converter tests printed debug output to stdout.
- Fixed: `USAGE.md` and `EXPOSED_METHODS.md` referenced the old camelCase converter import path.
