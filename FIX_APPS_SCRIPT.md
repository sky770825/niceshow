# Google Apps Script 代码修复指南

## ⚠️ 需要修复的问题

您的 Google Apps Script 代码中使用了 `console.log()`，应该改为 `Logger.log()`

## 🔧 修复方法

### 方法 1: 手动替换（推荐）

在 Google Apps Script 编辑器中：

1. 按 `Ctrl+H`（Windows）或 `Cmd+H`（Mac）打开查找和替换
2. 查找：`console.log`
3. 替换为：`Logger.log`
4. 点击"全部替换"

然后对 `console.error` 和 `console.warn` 做同样的操作：

- `console.error` → `Logger.log('错误: ' + ...)`
- `console.warn` → `Logger.log('警告: ' + ...)`

### 方法 2: 使用正则表达式替换

在查找替换中启用正则表达式模式：

**替换 console.log：**
- 查找：`console\.log\(`
- 替换为：`Logger.log(`

**替换 console.error：**
- 查找：`console\.error\(`
- 替换为：`Logger.log('错误: ' + `

**替换 console.warn：**
- 查找：`console\.warn\(`
- 替换为：`Logger.log('警告: ' + `

## 📝 注意事项

1. **Logger.log() 的输出位置**：
   - 执行脚本后，点击左侧菜单的"执行记录"
   - 或使用菜单："查看" → "执行记录"

2. **代码中 `console.log()` 的位置**：
   - 您的代码中有很多 `console.log()`，需要全部替换
   - 大约有 100+ 处需要替换

3. **关于 `window` 错误**：
   - 如果您在代码中没有使用 `window`，错误可能是其他原因
   - 检查是否有其他文件或代码片段使用了 `window`

## ✅ 修复后的效果

替换完成后：
- ✅ 所有日志会显示在执行记录中
- ✅ 不会再出现 `window is not defined` 错误（如果代码中没有使用 window）
- ✅ 代码可以正常运行

## 🔍 快速检查清单

替换完成后，检查以下内容：

- [ ] 所有 `console.log` 已替换为 `Logger.log`
- [ ] 所有 `console.error` 已替换为 `Logger.log('错误: ' + ...)`
- [ ] 所有 `console.warn` 已替换为 `Logger.log('警告: ' + ...)`
- [ ] 代码中没有 `window.xxx` 的使用
- [ ] 代码中没有 `localStorage` 的使用（应使用 PropertiesService）
- [ ] 代码中没有 `document.xxx` 的使用

## 💡 提示

如果替换后还有问题，请检查：
1. 是否有其他 .gs 文件也使用了 console.log
2. 是否有 HTML 文件中的代码被误放到 .gs 文件中
3. 错误信息中的具体行号和错误内容

