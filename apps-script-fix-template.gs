/**
 * Google Apps Script 修复模板
 * 用于修复 "window is not defined" 错误
 */

// ==================== 常见的错误修复示例 ====================

/**
 * ❌ 错误示例 1: 使用 console.log()
 */
function badExample1() {
  // console.log('这是错误');  // ❌ Apps Script 中没有 console
  Logger.log('这是正确的');  // ✅ 使用 Logger.log()
}

/**
 * ❌ 错误示例 2: 使用 window 对象
 */
function badExample2() {
  // window.myVar = 'value';  // ❌ Apps Script 中没有 window
  var myVar = 'value';  // ✅ 使用局部变量
  Logger.log(myVar);
}

/**
 * ❌ 错误示例 3: 使用 localStorage
 */
function badExample3() {
  // localStorage.setItem('key', 'value');  // ❌ Apps Script 中没有 localStorage
  PropertiesService.getScriptProperties().setProperty('key', 'value');  // ✅ 使用 PropertiesService
}

/**
 * ✅ 正确示例: 完整的 Web App 函数
 */
function doGet() {
  Logger.log('开始执行 doGet');
  
  try {
    // 获取存储的数据
    var storedData = PropertiesService.getScriptProperties().getProperty('myData');
    Logger.log('存储的数据: ' + storedData);
    
    // 返回内容
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: storedData || 'no data'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('错误: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ✅ 正确示例: 处理 POST 请求
 */
function doPost(e) {
  Logger.log('开始执行 doPost');
  
  try {
    // 获取 POST 数据
    var postData = e.postData ? JSON.parse(e.postData.contents) : {};
    Logger.log('POST 数据: ' + JSON.stringify(postData));
    
    // 存储数据
    if (postData.key && postData.value) {
      PropertiesService.getScriptProperties().setProperty(
        postData.key, 
        JSON.stringify(postData.value)
      );
    }
    
    // 返回响应
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('错误: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ✅ 正确示例: 调用外部 API
 */
function callExternalAPI() {
  try {
    // ✅ 使用 UrlFetchApp 代替 fetch()
    var response = UrlFetchApp.fetch('https://api.example.com/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    var data = JSON.parse(response.getContentText());
    Logger.log('API 响应: ' + JSON.stringify(data));
    
    return data;
    
  } catch (error) {
    Logger.log('API 调用错误: ' + error.toString());
    return null;
  }
}

/**
 * ✅ 正确示例: 数据存储和检索
 */
function saveData(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(value));
  Logger.log('数据已保存: ' + key);
}

function getData(key) {
  var data = PropertiesService.getScriptProperties().getProperty(key);
  return data ? JSON.parse(data) : null;
}

function deleteData(key) {
  PropertiesService.getScriptProperties().deleteProperty(key);
  Logger.log('数据已删除: ' + key);
}

// ==================== 在您的代码中的修复步骤 ====================
/*
1. 找到第849行的代码
2. 检查是否使用了 window, console, document, localStorage 等
3. 根据上面的示例进行替换
4. 保存并重新部署
5. 测试是否还有错误
*/

