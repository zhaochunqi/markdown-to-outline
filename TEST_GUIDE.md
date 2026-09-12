# 弱网优化测试指南

## 快速开始

### 1. 构建生产版本
```bash
npm run build
```

### 2. 启动生产服务器
```bash
PORT=3001 npm start
```

或者使用 standalone 模式：
```bash
node .next/standalone/server.js
```

### 3. 访问应用
打开浏览器访问：http://localhost:3001

---

## 测试场景

### ✅ 场景 1：测试 Service Worker 注册

**步骤：**
1. 打开 http://localhost:3001
2. 打开开发者工具（F12）
3. 切换到 **Application** 标签
4. 左侧选择 **Service Workers**
5. 确认看到 Service Worker 已激活

**预期结果：**
- 状态显示为 "activated and is running"
- 可以看到 sw.js 文件

---

### ✅ 场景 2：测试离线功能

**步骤：**
1. 首次访问 http://localhost:3001（确保资源已缓存）
2. 打开开发者工具 → **Network** 标签
3. 选择 **Offline** 模式（下拉菜单）
4. 刷新页面（Cmd+R 或 Ctrl+R）

**预期结果：**
- 页面正常加载
- 所有功能可用（Markdown ⇄ Logseq 转换）
- 没有网络请求错误

---

### ✅ 场景 3：测试弱网环境（Slow 3G）

**步骤：**
1. 清除浏览器缓存（可选，测试首次加载）
2. 打开开发者工具 → **Network** 标签
3. 选择 **Slow 3G** 模式
4. 刷新页面

**预期结果：**
- 首次加载：显示骨架屏，然后加载完成
- 再次刷新：从缓存快速加载（< 1 秒）

---

### ✅ 场景 4：测试缓存效果

**步骤：**
1. 首次访问 http://localhost:3001
2. 打开开发者工具 → **Network** 标签
3. 记录加载时间和资源大小
4. 刷新页面（Cmd+R）
5. 对比加载时间

**预期结果：**
- 首次加载：~100-200ms（取决于网络）
- 重复加载：~50-100ms（从缓存）
- 大部分资源显示 "(ServiceWorker)" 或 "from ServiceWorker"

---

### ✅ 场景 5：测试更新提示

**步骤：**
1. 访问 http://localhost:3001
2. 修改任意代码文件（如 app/page.tsx）
3. 重新构建：`npm run build`
4. 重启服务器：`PORT=3001 npm start`
5. 刷新浏览器页面

**预期结果：**
- 右下角出现"新版本可用"提示
- 点击"立即更新"后页面刷新
- 看到最新的代码变更

---

### ✅ 场景 6：测试错误处理

**步骤：**
1. 打开开发者工具 → **Network** 标签
2. 选择 **Offline** 模式
3. 清除所有缓存（Application → Clear storage → Clear site data）
4. 刷新页面

**预期结果：**
- 显示友好的错误提示
- 提供"重新加载"按钮
- 不会白屏

---

### ✅ 场景 7：测试骨架屏

**步骤：**
1. 清除浏览器缓存
2. 打开开发者工具 → **Network** 标签
3. 选择 **Slow 3G** 模式
4. 刷新页面

**预期结果：**
- 立即显示骨架屏（灰色占位符）
- 内容加载完成后骨架屏消失
- 没有白屏时间

---

### ✅ 场景 8：测试实际转换功能

**步骤：**
1. 在 Markdown 编辑器输入：
```markdown
# 标题
- 列表项
- [ ] 待办事项
```

2. 观察右侧 Logseq 输出

**预期结果：**
- 实时转换（300ms 防抖）
- 转换正确
- 离线状态下也能正常工作

---

## 性能指标检查

### 查看缓存内容
1. 开发者工具 → **Application** 标签
2. 左侧选择 **Cache Storage**
3. 展开查看缓存的资源

**应该看到：**
- `static-v1`: 静态资源（manifest.json 等）
- `markdown-logseq-converter-v1`: 页面和资源
- `runtime-v1`: 运行时资源

### 查看加载性能
1. 开发者工具 → **Network** 标签
2. 刷新页面
3. 查看底部的统计信息

**首次加载（无缓存）：**
- 请求数：~10-20 个
- 传输大小：~100-200 KB
- 加载时间：~500-2000ms（取决于网络）

**重复加载（有缓存）：**
- 请求数：~5-10 个
- 传输大小：~0-50 KB（大部分从缓存）
- 加载时间：~50-200ms

---

## 常见问题

### Q: Service Worker 没有注册？
**A:** 确保：
1. 使用生产构建（`npm run build`）
2. 使用 HTTP 或 HTTPS（不是 file://）
3. 浏览器支持 Service Worker

### Q: 离线模式下页面无法加载？
**A:** 确保：
1. 首次访问时已经缓存了资源
2. Service Worker 已激活
3. 没有清除缓存

### Q: 更新提示不出现？
**A:** 确保：
1. 代码确实有变更
2. 重新构建了应用
3. 重启了服务器
4. 刷新了浏览器

### Q: 骨架屏不显示？
**A:** 骨架屏只在首次加载或慢速网络时显示，如果加载很快可能看不到。

---

## 浏览器兼容性

### 支持的浏览器
- ✅ Chrome 45+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+

### 不支持的浏览器
- ❌ IE 11 及以下
- ❌ 旧版 Android 浏览器

---

## 调试技巧

### 强制更新 Service Worker
1. 开发者工具 → Application → Service Workers
2. 勾选 "Update on reload"
3. 刷新页面

### 清除所有缓存
1. 开发者工具 → Application
2. 左侧选择 "Clear storage"
3. 点击 "Clear site data"

### 查看 Service Worker 日志
1. 开发者工具 → Console
2. 筛选 "sw.js" 相关日志

---

## 下一步

测试完成后，你可以：
1. 部署到生产环境（Vercel、Netlify 等）
2. 添加更多优化（见 `WEAK_NETWORK_OPTIMIZATION.md`）
3. 监控实际用户的性能指标
