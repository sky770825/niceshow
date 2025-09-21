@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 測試部署功能

echo 測試部署功能...
echo.

echo 可用的版本：
dir /b | findstr "^v" 2>nul
if errorlevel 1 (
    echo ❌ 沒有找到版本資料夾！
    echo 請先使用「建立版本備份」功能
    echo.
    echo 按任意鍵返回主選單...
    pause >nul
    echo 返回主選單
) else (
    echo 找到版本資料夾
    echo.
    echo 測試完成！
)

pause
