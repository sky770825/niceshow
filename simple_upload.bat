@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 簡化版快速上傳

echo 簡化版快速上傳到 GitHub
echo.

REM 檢查Git狀態
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 沒有發現GitHub倉庫
    echo 請先使用「初始化/連接 GitHub 倉庫」功能
    echo.
    pause
    exit
)

REM 顯示專案資訊
for /f "tokens=4,5 delims=/" %%i in ('git remote get-url origin') do (
    set current_user=%%i
    set current_repo=%%j
)
set current_repo=%current_repo:.git=%
echo 📋 當前專案：%current_user%/%current_repo%
echo.

echo 🔄 正在上傳檔案...
echo.

echo 步驟1: 添加所有檔案...
git add .
if errorlevel 1 (
    echo ❌ 添加檔案失敗
    pause
    exit
)
echo ✅ 檔案已添加

echo.
echo 步驟2: 提交變更...
set commit_msg=更新餐開月行程表 - %date% %time%
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ⚠️  提交失敗（可能沒有變更需要提交）
    echo 直接嘗試推送...
    goto push_only
)
echo ✅ 變更已提交

:push_only
echo.
echo 步驟3: 推送到GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ 推送到main失敗，嘗試master分支...
    git push origin master
    if errorlevel 1 (
        echo ❌ 推送失敗
        echo 可能原因：網路連接問題或GitHub認證問題
        pause
        exit
    ) else (
        echo ✅ 已推送到master分支
    )
) else (
    echo ✅ 已推送到main分支
)

echo.
echo 上傳完成！
echo.
echo 🌐 您的網站地址：
echo %current_user%.github.io/%current_repo%
echo.
pause
