@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title GitHub 管理工具

echo.
echo ========================================
echo           GitHub 管理工具
echo ========================================
echo.

:main_menu
echo.
echo 主選單:
echo.
echo 1. 快速切換專案
echo 2. 修復認證問題
echo 3. 快速推送
echo 4. 查看專案資訊
echo 5. 退出
echo.

set /p choice=請選擇操作 (1-5): 

if "%choice%"=="1" goto quick_switch
if "%choice%"=="2" goto fix_auth
if "%choice%"=="3" goto quick_push
if "%choice%"=="4" goto show_info
if "%choice%"=="5" goto exit
goto main_menu

:quick_switch
echo.
echo 快速切換專案
echo.
echo 1. 餐開月行程表 (sky770825)
echo 2. 濬聯配件專用 (liny14705)
echo 3. 添加新專案
echo 4. 返回主選單
echo.

set /p quick_choice=請選擇 (1-4): 

if "%quick_choice%"=="1" goto switch_sky
if "%quick_choice%"=="2" goto switch_liny
if "%quick_choice%"=="3" goto add_new
if "%quick_choice%"=="4" goto main_menu
goto quick_switch

:switch_sky
echo.
echo 正在切換到餐開月行程表專案...
echo.

REM 清除現有認證
echo 清除現有認證...
cmdkey /delete:git:https://github.com >nul 2>&1
git config --global --unset credential.helper >nul 2>&1

REM 設定專案
echo 設定專案認證...
git config --global user.name "sky770825"
git config --global user.email "sky19880825@gmail.com"

echo 設定遠端倉庫...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/sky770825/niceshow.git

echo.
echo 已切換到餐開月行程表專案
echo 用戶名: sky770825
echo 電子郵件: sky19880825@gmail.com
echo 倉庫: https://github.com/sky770825/niceshow.git
echo 網站: https://sky770825.github.io/niceshow
echo.

echo 是否要立即推送變更? (y/n)
set /p push_choice=請選擇: 
if /i "%push_choice%"=="y" (
    echo.
    echo 正在推送變更...
    git add . >nul 2>&1
    git commit -m "切換到餐開月行程表專案 - %date% %time%" >nul 2>&1
    git push origin main
    if errorlevel 1 (
        echo 推送失敗，可能需要 Personal Access Token
    ) else (
        echo 推送成功！
    )
)

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:switch_liny
echo.
echo 正在切換到濬聯配件專用專案...
echo.

REM 清除現有認證
echo 清除現有認證...
cmdkey /delete:git:https://github.com >nul 2>&1
git config --global --unset credential.helper >nul 2>&1

REM 設定專案
echo 設定專案認證...
git config --global user.name "liny14705"
git config --global user.email "liny14705@gmail.com"

echo 設定遠端倉庫...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/liny14705/nicehouse.git

echo.
echo 已切換到濬聯配件專用專案
echo 用戶名: liny14705
echo 電子郵件: liny14705@gmail.com
echo 倉庫: https://github.com/liny14705/nicehouse.git
echo 網站: https://liny14705.github.io/nicehouse
echo.

echo 是否要立即推送變更? (y/n)
set /p push_choice=請選擇: 
if /i "%push_choice%"=="y" (
    echo.
    echo 正在推送變更...
    git add . >nul 2>&1
    git commit -m "切換到濬聯配件專用專案 - %date% %time%" >nul 2>&1
    git push origin main
    if errorlevel 1 (
        echo 推送失敗，可能需要 Personal Access Token
    ) else (
        echo 推送成功！
    )
)

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:add_new
echo.
echo 添加新專案
echo.
set /p new_name=專案名稱: 
set /p new_username=GitHub 用戶名: 
set /p new_email=GitHub 電子郵件: 
set /p new_repo=倉庫 URL: 
set /p new_website=網站 URL: 

echo.
echo 正在切換到新專案...

REM 清除現有認證
cmdkey /delete:git:https://github.com >nul 2>&1
git config --global --unset credential.helper >nul 2>&1

REM 設定新專案
git config --global user.name "%new_username%"
git config --global user.email "%new_email%"
git remote remove origin >nul 2>&1
git remote add origin "%new_repo%"

echo.
echo 已切換到新專案: %new_name%
echo 用戶名: %new_username%
echo 電子郵件: %new_email%
echo 倉庫: %new_repo%
echo 網站: %new_website%
echo.

echo 是否要立即推送變更? (y/n)
set /p push_choice=請選擇: 
if /i "%push_choice%"=="y" (
    echo.
    echo 正在推送變更...
    git add . >nul 2>&1
    git commit -m "切換到 %new_name% 專案 - %date% %time%" >nul 2>&1
    git push origin main
    if errorlevel 1 (
        echo 推送失敗，可能需要 Personal Access Token
    ) else (
        echo 推送成功！
    )
)

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:fix_auth
echo.
echo 修復認證問題
echo.

echo 當前設定:
git config --global user.name
git config --global user.email
git remote -v
echo.

set /p fix_username=請輸入正確的 GitHub 用戶名: 
set /p fix_email=請輸入正確的 GitHub 電子郵件: 

REM 清除現有認證
cmdkey /delete:git:https://github.com >nul 2>&1
git config --global --unset credential.helper >nul 2>&1

REM 設定新認證
git config --global user.name "%fix_username%"
git config --global user.email "%fix_email%"

echo.
echo 認證已修復
echo.

echo 正在嘗試推送...
git add . >nul 2>&1
git commit -m "修復認證問題 - %date% %time%" >nul 2>&1
git push origin main

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:quick_push
echo.
echo 快速推送到當前專案
echo.

echo 當前專案設定:
git config --global user.name
git config --global user.email
git remote -v
echo.

echo 正在提交變更...
git add . >nul 2>&1
git commit -m "快速更新 - %date% %time%" >nul 2>&1

echo 正在推送到 GitHub...
git push origin main

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:show_info
echo.
echo 所有專案資訊:
echo.

powershell -Command "
$json = Get-Content 'github_accounts.json' | ConvertFrom-Json
$json.accounts | ForEach-Object { 
    Write-Output \"帳戶: $($_.name) ($($_.username))\"
    Write-Output \"  電子郵件: $($_.email)\"
    Write-Output \"  描述: $($_.description)\"
    Write-Output \"  專案:\"
    $_.projects | ForEach-Object {
        Write-Output \"    - $($_.name): $($_.description)\"
        Write-Output \"      倉庫: $($_.repository)\"
        Write-Output \"      網站: $($_.website)\"
    }
    Write-Output \"\"
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:exit
echo.
echo 感謝使用 GitHub 管理工具！
echo.
pause
exit
