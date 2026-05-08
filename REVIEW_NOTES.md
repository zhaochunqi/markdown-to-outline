# Review Notes

## 2026-05-09

Current improvement backlog from project review:

- `pnpm exec tsc --noEmit` fails while `next.config.mjs` skips TypeScript and ESLint during `pnpm build`. Fix the toast type errors, then remove the build ignores.
- `hooks/useMarkdownToOutline.ts` rejects any content containing `#` without a Markdown heading line. This can incorrectly reject plain text such as URL fragments, tags, or language names.
- `hooks/useServiceWorker.ts` starts an hourly update interval without clearing it in effect cleanup.
- Several converter tests still print debug output to stdout, which makes CI output harder to read.
- `USAGE.md` and `EXPOSED_METHODS.md` still reference the old `./utils/markdownConverter` import path instead of `./utils/markdown-converter`.
