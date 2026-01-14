# 修复 Google Apps Script `window is not defined` 错误

## 🔍 错误信息
```
ReferenceError: window is not defined (line 849, file "程式碼")
```

## ❌ 常见错误用法

### 1. 使用 `console.log()`
```javascript
// ❌ 错误 - Apps Script 中没有 console 对象
console.log('调试信息');
console.error('错误信息');
console.warn('警告信息');

// ✅ 正确 - 使用 Logger
Logger.log('调试信息');
Logger.log('错误信息');
Logger.log('警告信息');
```

### 2. 使用 `window` 对象
```javascript
// ❌ 错误 - Apps Script 中没有 window 对象
window.someVariable = value;
window.localStorage = ...;
window.alert('消息');

// ✅ 正确 - 使用 Apps Script 的方法
// 存储数据
PropertiesService.getScriptProperties().setProperty('key', value);
// 显示消息（在 Web App 中）
return ContentService.createTextOutput('消息');
```

### 3. 使用 `document` 对象
```javascript
// ❌ 错误 - Apps Script 中没有 document 对象
document.getElementById('id');
document.querySelector('.class');

// ✅ 正确 - 在 Apps Script 中使用 HTML 服务
// 在 HTML 文件中使用，而不是在 .gs 文件中
```

### 4. 使用浏览器 API
```javascript
// ❌ 错误
localStorage.setItem('key', value);
sessionStorage.setItem('key', value);
XMLHttpRequest();
fetch();

// ✅ 正确
// 使用 UrlFetchApp.fetch() 代替 fetch()
// 使用 PropertiesService 代替 localStorage/sessionStorage
```

## 🛠️ 修复步骤

### 步骤 1: 打开 Google Apps Script 编辑器
1. 访问 [script.google.com](https://script.google.com)
2. 找到您部署的项目
3. 点击"程式碼"文件，查看第849行

### 步骤 2: 检查第849行代码
查看第849行附近是否有以下代码：

```javascript
// 查找这些模式
window.
console.
document.
localStorage.
sessionStorage.
```

### 步骤 3: 替换为 Apps Script 等效代码

#### 替换 console.log()
```javascript
// 找到所有 console.log()
console.log('消息');           → Logger.log('消息');
console.error('错误');         → Logger.log('错误: ' + '错误');
console.warn('警告');          → Logger.log('警告: ' + '警告');
```

#### 替换 window 对象
```javascript
// 如果是存储数据
window.data = value;           → PropertiesService.getScriptProperties().setProperty('data', JSON.stringify(value));

// 如果是访问全局变量，直接使用变量名
window.myVar;                  → myVar;  // 如果是在同一文件中定义的变量
```

#### 替换 localStorage
```javascript
// 存储
localStorage.setItem('key', value);  
→ PropertiesService.getScriptProperties().setProperty('key', JSON.stringify(value));

// 读取
localStorage.getItem('key');   
→ JSON.parse(PropertiesService.getScriptProperties().getProperty('key') || '{}');

// 删除
localStorage.removeItem('key'); 
→ PropertiesService.getScriptProperties().deleteProperty('key');
```

### 步骤 4: 常见修复模板

#### 模板 1: 简单的日志记录
```javascript
// 修复前
function doGet() {
  console.log('开始执行');
  window.debug = true;
  return ContentService.createTextOutput('完成');
}

// 修复后
function doGet() {
  Logger.log('开始执行');
  // window.debug = true;  // 删除或使用变量
  var debug = true;  // 如果需要，使用局部变量
  return ContentService.createTextOutput('完成');
}
```

#### 模板 2: 数据存储
```javascript
// 修复前
function saveData() {
  window.data = { name: 'test' };
  localStorage.setItem('user', JSON.stringify(window.data));
}

// 修复后
function saveData() {
  var data = { name: 'test' };
  PropertiesService.getScriptProperties().setProperty('user', JSON.stringify(data));
}

function getData() {
  var userData = PropertiesService.getScriptProperties().getProperty('user');
  return userData ? JSON.parse(userData) : null;
}
```

#### 模板 3: 调试代码
```javascript
// 修复前
function myFunction() {
  console.log('变量值:', window.myVar);
  console.error('错误:', error);
}

// 修复后
function myFunction() {
  var myVar = 'value';  // 使用局部变量
  Logger.log('变量值: ' + myVar);
  
  try {
    // 代码
  } catch (error) {
    Logger.log('错误: ' + error.toString());
  }
}
```

## 🔧 快速修复检查清单

在您的代码中查找并替换：

- [ ] `console.log` → `Logger.log`
- [ ] `console.error` → `Logger.log('错误: ' + ...)`
- [ ] `console.warn` → `Logger.log('警告: ' + ...)`
- [ ] `window.` → 删除或使用局部变量
- [ ] `document.` → 移至 HTML 文件中
- [ ] `localStorage` → `PropertiesService`
- [ ] `sessionStorage` → `PropertiesService`
- [ ] `fetch()` → `UrlFetchApp.fetch()`

## 📝 如果问题仍然存在

1. **检查所有文件**：错误可能在 HTML 文件（.html）中，而不是 .gs 文件中
2. **检查 HTML 服务**：如果在返回 HTML，确保 HTML 代码在 .html 文件中
3. **查看完整错误日志**：在 Apps Script 编辑器中点击"执行"查看完整错误信息

## 💡 提示

- 使用 `Logger.log()` 输出的内容可以在"执行记录"中查看
- 使用 `PropertiesService` 存储的数据是持久的
- 如果需要在客户端（浏览器）使用 JavaScript，应该放在 HTML 文件中，而不是 .gs 文件中

