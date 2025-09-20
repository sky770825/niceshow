@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title GitHub 認證自動修復工具

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🔧 GitHub 認證自動修復工具                    ║
echo ║                   解決 liny14705 問題                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 正在診斷當前認證狀況...
echo.

REM 檢查當前 Git 配置
echo 📋 當前 Git 配置：
git config --global user.name
git config --global user.email
echo.

REM 檢查遠端倉庫
echo 🌐 遠端倉庫設定：
git remote -v
echo.

echo 🔧 開始自動修復...
echo.

REM 步驟 1: 清除現有的認證
echo 步驟 1: 清除現有的 Windows 認證...
cmdkey /delete:git:https://github.com >nul 2>&1
if errorlevel 1 (
    echo ✅ 沒有找到現有的 GitHub 認證
) else (
    echo ✅ 已清除現有的 GitHub 認證
)

REM 步驟 2: 清除 Git 配置
echo.
echo 步驟 2: 清除 Git 全域配置...
git config --global --unset user.name >nul 2>&1
git config --global --unset user.email >nul 2>&1
echo ✅ 已清除 Git 全域配置

REM 步驟 3: 設定正確的用戶名
echo.
echo 步驟 3: 設定正確的 GitHub 用戶名...
set /p github_username=請輸入您的 GitHub 用戶名 (預設: sky770825): 
if "%github_username%"=="" set github_username=sky770825

set /p github_email=請輸入您的 GitHub 電子郵件: 
if "%github_email%"=="" set github_email=sky770825@users.noreply.github.com

git config --global user.name "%github_username%"
git config --global user.email "%github_email%"
echo ✅ 已設定 Git 用戶名: %github_username%
echo ✅ 已設定 Git 電子郵件: %github_email%

REM 步驟 4: 清除本地 Git 認證快取
echo.
echo 步驟 4: 清除本地 Git 認證快取...
git config --global --unset credential.helper >nul 2>&1
echo ✅ 已清除 Git 認證快取

REM 步驟 5: 重新設定遠端 URL
echo.
echo 步驟 5: 重新設定遠端倉庫 URL...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/sky770825/niceshow.git
echo ✅ 已重新設定遠端倉庫

REM 步驟 6: 嘗試推送
echo.
echo 步驟 6: 嘗試推送到 GitHub...
echo 📝 正在提交變更...
git add . >nul 2>&1
git commit -m "自動修復 liny14705 認證問題 - %date% %time%" >nul 2>&1

echo 🔄 正在推送到 GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo ❌ 推送失敗，可能需要 Personal Access Token
    echo.
    echo 💡 解決方案：
    echo 1. 前往 https://github.com/settings/tokens
    echo 2. 建立新的 Personal Access Token (選擇 repo 權限)
    echo 3. 使用以下命令推送：
    echo    git push https://%github_username%:YOUR_TOKEN@github.com/sky770825/niceshow.git main
    echo.
    echo 或者使用網頁版 GitHub 手動上傳 data.json 檔案
    echo.
) else (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                    🎉 修復成功！                            ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo ✅ liny14705 問題已解決
    echo ✅ 檔案已成功推送到 GitHub
    echo ✅ 網站應該可以正常顯示了
    echo.
    echo 🌐 您的網站地址：
    echo https://sky770825.github.io/niceshow
)

echo.
echo 按任意鍵退出...
pause >nul
