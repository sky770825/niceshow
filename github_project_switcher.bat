@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title GitHub 專案切換工具

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🔄 GitHub 專案切換工具                        ║
echo ║              支援多專案認證快速切換                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 檢查是否存在專案配置文件
if not exist "github_projects.json" (
    echo 📝 正在創建專案配置文件...
    echo {> github_projects.json
    echo   "projects": [>> github_projects.json
    echo     {>> github_projects.json
    echo       "name": "餐開月行程表",>> github_projects.json
    echo       "username": "sky770825",>> github_projects.json
    echo       "email": "sky770825@users.noreply.github.com",>> github_projects.json
    echo       "repository": "https://github.com/sky770825/niceshow.git",>> github_projects.json
    echo       "website": "https://sky770825.github.io/niceshow",>> github_projects.json
    echo       "isDefault": true>> github_projects.json
    echo     }>> github_projects.json
    echo   ]>> github_projects.json
    echo }>> github_projects.json
    echo ✅ 已創建預設專案配置
    echo.
)

:main_menu
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        主選單                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 1. 🔄 切換到現有專案
echo 2. ➕ 添加新專案
echo 3. ✏️  編輯專案設定
echo 4. 🗑️  刪除專案
echo 5. 📋 查看所有專案
echo 6. 🔧 修復當前認證
echo 7. 🚀 快速推送到當前專案
echo 8. ❌ 退出
echo.

set /p choice=請選擇操作 (1-8): 

if "%choice%"=="1" goto switch_project
if "%choice%"=="2" goto add_project
if "%choice%"=="3" goto edit_project
if "%choice%"=="4" goto delete_project
if "%choice%"=="5" goto list_projects
if "%choice%"=="6" goto fix_auth
if "%choice%"=="7" goto quick_push
if "%choice%"=="8" goto exit
goto main_menu

:switch_project
echo.
echo 📋 可用的專案：
echo.

REM 讀取並顯示專案列表
for /f "tokens=*" %%i in ('powershell -Command "Get-Content 'github_projects.json' | ConvertFrom-Json | ForEach-Object { $_.projects } | ForEach-Object { $index = 0; $_ | ForEach-Object { Write-Output \"$($index + 1). $($_.name) ($($_.username))\" ; $index++ } }"') do (
    echo %%i
)

echo.
set /p project_num=請選擇專案編號: 

REM 切換到選定的專案
powershell -Command "
$json = Get-Content 'github_projects.json' | ConvertFrom-Json
$project = $json.projects[$project_num - 1]
if ($project) {
    Write-Output \"正在切換到: $($project.name)\"
    Write-Output \"用戶名: $($project.username)\"
    Write-Output \"電子郵件: $($project.email)\"
    Write-Output \"倉庫: $($project.repository)\"
    
    # 設定 Git 配置
    git config --global user.name $project.username
    git config --global user.email $project.email
    
    # 設定遠端倉庫
    git remote remove origin 2>$null
    git remote add origin $project.repository
    
    Write-Output \"✅ 已切換到專案: $($project.name)\"
} else {
    Write-Output \"❌ 無效的專案編號\"
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:add_project
echo.
echo ➕ 添加新專案
echo.
set /p new_name=專案名稱: 
set /p new_username=GitHub 用戶名: 
set /p new_email=GitHub 電子郵件: 
set /p new_repo=倉庫 URL (https://github.com/username/repo.git): 
set /p new_website=網站 URL (https://username.github.io/repo): 

powershell -Command "
$json = Get-Content 'github_projects.json' | ConvertFrom-Json
$newProject = @{
    name = '$new_name'
    username = '$new_username'
    email = '$new_email'
    repository = '$new_repo'
    website = '$new_website'
    isDefault = $false
}
$json.projects += $newProject
$json | ConvertTo-Json -Depth 3 | Set-Content 'github_projects.json'
Write-Output \"✅ 已添加專案: $new_name\"
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:edit_project
echo.
echo ✏️ 編輯專案設定
echo.

REM 顯示專案列表
for /f "tokens=*" %%i in ('powershell -Command "Get-Content 'github_projects.json' | ConvertFrom-Json | ForEach-Object { $_.projects } | ForEach-Object { $index = 0; $_ | ForEach-Object { Write-Output \"$($index + 1). $($_.name) ($($_.username))\" ; $index++ } }"') do (
    echo %%i
)

echo.
set /p edit_num=請選擇要編輯的專案編號: 

echo.
echo 請輸入新的設定 (留空表示保持原值):
set /p edit_name=專案名稱: 
set /p edit_username=GitHub 用戶名: 
set /p edit_email=GitHub 電子郵件: 
set /p edit_repo=倉庫 URL: 
set /p edit_website=網站 URL: 

powershell -Command "
$json = Get-Content 'github_projects.json' | ConvertFrom-Json
$project = $json.projects[$edit_num - 1]
if ($project) {
    if ('$edit_name' -ne '') { $project.name = '$edit_name' }
    if ('$edit_username' -ne '') { $project.username = '$edit_username' }
    if ('$edit_email' -ne '') { $project.email = '$edit_email' }
    if ('$edit_repo' -ne '') { $project.repository = '$edit_repo' }
    if ('$edit_website' -ne '') { $project.website = '$edit_website' }
    
    $json | ConvertTo-Json -Depth 3 | Set-Content 'github_projects.json'
    Write-Output \"✅ 已更新專案設定\"
} else {
    Write-Output \"❌ 無效的專案編號\"
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:delete_project
echo.
echo 🗑️ 刪除專案
echo.

REM 顯示專案列表
for /f "tokens=*" %%i in ('powershell -Command "Get-Content 'github_projects.json' | ConvertFrom-Json | ForEach-Object { $_.projects } | ForEach-Object { $index = 0; $_ | ForEach-Object { Write-Output \"$($index + 1). $($_.name) ($($_.username))\" ; $index++ } }"') do (
    echo %%i
)

echo.
set /p delete_num=請選擇要刪除的專案編號: 

powershell -Command "
$json = Get-Content 'github_projects.json' | ConvertFrom-Json
if ($delete_num -le $json.projects.Count -and $delete_num -gt 0) {
    $projectName = $json.projects[$delete_num - 1].name
    $json.projects = $json.projects | Where-Object { $json.projects.IndexOf($_) -ne ($delete_num - 1) }
    $json | ConvertTo-Json -Depth 3 | Set-Content 'github_projects.json'
    Write-Output \"✅ 已刪除專案: $projectName\"
} else {
    Write-Output \"❌ 無效的專案編號\"
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:list_projects
echo.
echo 📋 所有專案列表：
echo.

powershell -Command "
$json = Get-Content 'github_projects.json' | ConvertFrom-Json
$json.projects | ForEach-Object { $index = 0 } { 
    Write-Output \"$($index + 1). $($_.name)\"
    Write-Output \"   用戶名: $($_.username)\"
    Write-Output \"   電子郵件: $($_.email)\"
    Write-Output \"   倉庫: $($_.repository)\"
    Write-Output \"   網站: $($_.website)\"
    Write-Output \"\"
    $index++
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:fix_auth
echo.
echo 🔧 修復當前認證
echo.

REM 清除現有認證
echo 正在清除現有認證...
cmdkey /delete:git:https://github.com >nul 2>&1
git config --global --unset credential.helper >nul 2>&1

REM 獲取當前專案設定
for /f "tokens=*" %%i in ('git config --global user.name') do set current_username=%%i
for /f "tokens=*" %%i in ('git config --global user.email') do set current_email=%%i

echo 當前設定：
echo 用戶名: %current_username%
echo 電子郵件: %current_email%
echo.

set /p fix_username=請輸入正確的 GitHub 用戶名: 
set /p fix_email=請輸入正確的 GitHub 電子郵件: 

git config --global user.name "%fix_username%"
git config --global user.email "%fix_email%"

echo.
echo ✅ 認證已修復
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
echo 🚀 快速推送到當前專案
echo.

echo 當前專案設定：
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

:exit
echo.
echo 👋 感謝使用 GitHub 專案切換工具！
echo.
pause
exit
