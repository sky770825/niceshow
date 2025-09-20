@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:start
echo ================================
echo 測試選項7
echo ================================
echo.
echo 請選擇操作：
echo 1. 測試選項1
echo 2. 測試選項2
echo 7. 初始化 Git 倉庫
echo 13. 退出
echo.

set /p choice=請輸入選項 (1,2,7,13): 

if "%choice%"=="1" goto test1
if "%choice%"=="2" goto test2
if "%choice%"=="7" goto auto_init_git
if "%choice%"=="13" goto exit
echo 無效選項
pause
goto start

:test1
echo 選項1測試成功
pause
goto start

:test2
echo 選項2測試成功
pause
goto start

:auto_init_git
echo.
echo ================================
echo 🚀 初始化 Git 倉庫
echo ================================
echo.

echo 請輸入您的 GitHub 倉庫連結：
echo 範例 - https://github.com/username/repository-name
echo 或 - https://github.com/username/repository-name.git
echo.
set /p repo_url=請輸入 GitHub 連結: 

if "%repo_url%"=="" (
    echo ❌ 連結不能為空！
    pause
    goto start
)

echo.
echo 正在驗證連結格式...
echo %repo_url% | findstr "github.com" >nul
if errorlevel 1 (
    echo ❌ 無效的 GitHub 連結格式
    echo 請確保連結包含 github.com
    pause
    goto start
)
echo ✅ 連結格式正確

echo.
echo 正在處理 URL 格式...
if "%repo_url:~-4%"==".git" (
    echo ✅ URL 已包含 .git 後綴
) else (
    set repo_url=%repo_url%.git
    echo ✅ 已自動添加 .git 後綴
)

echo.
echo 正在檢查 Git 是否已安裝...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安裝或未正確配置
    echo 請先安裝 Git - https://git-scm.com/
    pause
    goto start
)
echo ✅ Git 已安裝

echo.
echo ================================
echo 🎉 測試完成！
echo ================================
echo.
echo 選項7可以正常運行
echo 輸入的連結: %repo_url%
echo.

pause
goto start

:exit
echo 退出
pause
exit
