# Review Notes

## 2026-05-09

Resolved items from project review:

- Fixed: `pnpm exec tsc --noEmit` failed while `next.config.mjs` skipped TypeScript and ESLint during `pnpm build`.
- Fixed: `hooks/useMarkdownToOutline.ts` rejected any content containing `#` without a Markdown heading line.
- Fixed: `hooks/useServiceWorker.ts` started an hourly update interval without clearing it in effect cleanup.
- Fixed: Several converter tests printed debug output to stdout.
- Fixed: `USAGE.md` and `EXPOSED_METHODS.md` referenced the old camelCase converter import path.

## 2026-10-29

升级到 Next.js 16 + React 19 + Tailwind CSS 4，修掉 Vercel 上 5 个失败的 preview：

- Next.js 14.2.35 → 16.4.3，React 18 → 19，`eslint-config-next` 同步到 16.4.3
- 删掉 `next.config.mjs` 里的 `swcMinify`（v16 已移除）和自定义 `webpack` 配置（Turbopack 默认开启，两者共存会直接拒绝构建）。手工 splitChunks 分包随之移除，交给 Turbopack 默认策略；要退回 Webpack 就在 build 脚本加 `--webpack`
- Tailwind 3.4 → 4.3.3：`postcss.config.mjs` 换 `@tailwindcss/postcss`，`app/globals.css` 的 `@tailwind base/components/utilities` 换 `@import 'tailwindcss'`，`tailwind.config.ts` 的 theme 迁进 `@theme inline`
- `next lint` 在 v16 已移除：`npm run lint` 改成 `eslint .`，`.eslintrc.json` 换成 flat config `eslint.config.mjs`
- 新规则 `react-hooks/set-state-in-effect` 报出两处：`useServiceWorker` 里没人用的 `isSupported` / `isRegistered` state 直接删掉，`ServiceWorkerProvider` 的 `showUpdatePrompt` 改成从 `needsUpdate && !dismissed` 派生
- 删掉没被引用的 `styles/globals.css`（create-next-app 模板遗留）
