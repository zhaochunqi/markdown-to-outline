#!/usr/bin/env node

/**
 * 验证弱网优化是否正确实施
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  const result = condition();
  checks.push({ name, passed: result, message });
  if (result) {
    passed++;
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}`);
    if (message) console.log(`   ${message}`);
  }
}

console.log('🔍 验证弱网优化配置...\n');

// 检查 Service Worker
check(
  'Service Worker 文件存在',
  () => fs.existsSync(path.join(__dirname, '../public/sw.js')),
  '缺少 public/sw.js 文件'
);

// 检查 manifest.json
check(
  'PWA Manifest 文件存在',
  () => fs.existsSync(path.join(__dirname, '../public/manifest.json')),
  '缺少 public/manifest.json 文件'
);

// 检查 Next.js 配置
check(
  'Next.js 配置包含优化',
  () => {
    const config = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf8');
    return config.includes('compress: true') && 
           config.includes('swcMinify: true') &&
           config.includes('splitChunks');
  },
  'next.config.mjs 缺少关键优化配置'
);

// 检查骨架屏组件
check(
  '骨架屏组件存在',
  () => fs.existsSync(path.join(__dirname, '../components/LoadingState.tsx')),
  '缺少 components/LoadingState.tsx 文件'
);

// 检查错误边界
check(
  '错误边界组件存在',
  () => fs.existsSync(path.join(__dirname, '../components/ErrorBoundary.tsx')),
  '缺少 components/ErrorBoundary.tsx 文件'
);

// 检查 Service Worker Provider
check(
  'Service Worker Provider 存在',
  () => fs.existsSync(path.join(__dirname, '../components/ServiceWorkerProvider.tsx')),
  '缺少 components/ServiceWorkerProvider.tsx 文件'
);

// 检查 useServiceWorker hook
check(
  'useServiceWorker Hook 存在',
  () => fs.existsSync(path.join(__dirname, '../hooks/useServiceWorker.ts')),
  '缺少 hooks/useServiceWorker.ts 文件'
);

// 检查全局样式优化
check(
  '全局样式包含字体优化',
  () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf8');
    return css.includes('-apple-system') && css.includes('font-smoothing');
  },
  'app/globals.css 缺少字体优化'
);

// 检查 layout 配置
check(
  'Layout 包含 PWA 元数据',
  () => {
    const layout = fs.readFileSync(path.join(__dirname, '../app/layout.tsx'), 'utf8');
    return layout.includes('manifest') && layout.includes('ErrorBoundary');
  },
  'app/layout.tsx 缺少 PWA 配置或错误边界'
);

// 检查构建输出
check(
  '生产构建存在',
  () => fs.existsSync(path.join(__dirname, '../.next')),
  '请先运行 pnpm build'
);

console.log('\n' + '='.repeat(50));
console.log(`总计: ${checks.length} 项检查`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 所有优化配置正确！');
  console.log('\n下一步：');
  console.log('1. 运行 pnpm build 构建生产版本');
  console.log('2. 运行 PORT=3001 pnpm start 启动服务器');
  console.log('3. 访问 http://localhost:3001 测试');
  console.log('4. 参考 TEST_GUIDE.md 进行完整测试');
  process.exit(0);
} else {
  console.log('\n⚠️  发现配置问题，请检查上述失败项');
  process.exit(1);
}
