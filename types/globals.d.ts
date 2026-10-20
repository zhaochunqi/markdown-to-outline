// 全局类型声明。
//
// TS 6 起默认开启 noUncheckedSideEffectImports：副作用导入（`import './globals.css'`）
// 必须能找到对应的模块声明，否则报 TS2882，next build 的类型检查也会因此失败。
// 这里给 CSS 副作用导入补上声明。
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
