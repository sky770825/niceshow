@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title GitHub 進階專案管理工具

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🚀 GitHub 進階專案管理工具                      ║
echo ║              支援多帳戶多專案管理                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:main_menu
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        主選單                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 1. 🔄 切換帳戶和專案
echo 2. ➕ 添加新專案到現有帳戶
echo 3. ➕ 添加新帳戶
echo 4. ✏️  編輯專案設定
echo 5. 🗑️  刪除專案
echo 6. 📋 查看所有帳戶和專案
echo 7. 🔧 修復當前認證
echo 8. 🚀 快速推送到當前專案
echo 9. ❌ 退出
echo.

set /p choice=請選擇操作 (1-9): 

if "%choice%"=="1" goto switch_account_project
if "%choice%"=="2" goto add_project_to_account
if "%choice%"=="3" goto add_new_account
if "%choice%"=="4" goto edit_project
if "%choice%"=="5" goto delete_project
if "%choice%"=="6" goto list_all
if "%choice%"=="7" goto fix_auth
if "%choice%"=="8" goto quick_push
if "%choice%"=="9" goto exit
goto main_menu

:switch_account_project
echo.
echo 🔄 切換帳戶和專案
echo.

REM 顯示帳戶列表
echo 📋 可用的帳戶：
echo.
for /f "tokens=*" %%i in ('powershell -Command "Get-Content 'github_accounts.json' | ConvertFrom-Json | ForEach-Object { $_.accounts } | ForEach-Object { $index = 0; $_ | ForEach-Object { Write-Output \"$($index + 1). $($_.name) ($($_.username))\" ; $index++ } }"') do (
    echo %%i
)

echo.
set /p account_num=請選擇帳戶編號: 

REM 顯示該帳戶的專案列表
echo.
echo 📋 該帳戶的專案：
echo.
for /f "tokens=*" %%i in ('powershell -Command "$json = Get-Content 'github_accounts.json' | ConvertFrom-Json; $account = $json.accounts[$account_num - 1]; if ($account) { $account.projects | ForEach-Object { $index = 0 } { Write-Output \"$($index + 1). $($_.name) - $($_.description)\" ; $index++ } }"') do (
    echo %%i
)

echo.
set /p project_num=請選擇專案編號: 

REM 切換到選定的帳戶和專案
powershell -Command "
$json = Get-Content 'github_accounts.json' | ConvertFrom-Json
$account = $json.accounts[$account_num - 1]
$project = $account.projects[$project_num - 1]

if ($account -and $project) {
    Write-Output \"正在切換到: $($account.name) - $($project.name)\"
    Write-Output \"用戶名: $($account.username)\"
    Write-Output \"電子郵件: $($account.email)\"
    Write-Output \"倉庫: $($project.repository)\"
    Write-Output \"網站: $($project.website)\"
    
    # 清除現有認證
    cmdkey /delete:git:https://github.com 2>$null
    git config --global --unset credential.helper 2>$null
    
    # 設定 Git 配置
    git config --global user.name $account.username
    git config --global user.email $account.email
    
    # 設定遠端倉庫
    git remote remove origin 2>$null
    git remote add origin $project.repository
    
    Write-Output \"✅ 已切換到專案: $($project.name)\"
} else {
    Write-Output \"❌ 無效的帳戶或專案編號\"
}
"

echo.
echo 是否要立即推送變更？ (y/n)
set /p push_choice=請選擇: 
if /i "%push_choice%"=="y" (
    echo.
    echo 🚀 正在推送變更...
    git add . >nul 2>&1
    git commit -m "切換專案 - %date% %time%" >nul 2>&1
    git push origin main
    if errorlevel 1 (
        echo ❌ 推送失敗，可能需要 Personal Access Token
    ) else (
        echo ✅ 推送成功！
    )
)

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:add_project_to_account
echo.
echo ➕ 添加新專案到現有帳戶
echo.

REM 顯示帳戶列表
echo 📋 可用的帳戶：
echo.
for /f "tokens=*" %%i in ('powershell -Command "Get-Content 'github_accounts.json' | ConvertFrom-Json | ForEach-Object { $_.accounts } | ForEach-Object { $index = 0; $_ | ForEach-Object { Write-Output \"$($index + 1). $($_.name) ($($_.username))\" ; $index++ } }"') do (
    echo %%i
)

echo.
set /p account_num=請選擇要添加專案的帳戶編號: 

echo.
set /p new_project_name=專案名稱: 
set /p new_repo=倉庫 URL (https://github.com/username/repo.git): 
set /p new_website=網站 URL (https://username.github.io/repo): 
set /p new_description=專案描述: 

powershell -Command "
$json = Get-Content 'github_accounts.json' | ConvertFrom-Json
$account = $json.accounts[$account_num - 1]

if ($account) {
    $newProject = @{
        name = '$new_project_name'
        repository = '$new_repo'
        website = '$new_website'
        description = '$new_description'
        isActive = $false
    }
    $account.projects += $newProject
    
    $json | ConvertTo-Json -Depth 4 | Set-Content 'github_accounts.json'
    Write-Output \"✅ 已添加專案 '$new_project_name' 到 $($account.name)\"
} else {
    Write-Output \"❌ 無效的帳戶編號\"
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:add_new_account
echo.
echo ➕ 添加新帳戶
echo.
set /p new_account_name=帳戶名稱: 
set /p new_username=GitHub 用戶名: 
set /p new_email=GitHub 電子郵件: 
set /p new_description=帳戶描述: 

powershell -Command "
$json = Get-Content 'github_accounts.json' | ConvertFrom-Json
$newAccount = @{
    name = '$new_account_name'
    username = '$new_username'
    email = '$new_email'
    description = '$new_description'
    isDefault = $false
    projects = @()
}
$json.accounts += $newAccount
$json | ConvertTo-Json -Depth 4 | Set-Content 'github_accounts.json'
Write-Output \"✅ 已添加新帳戶: $new_account_name\"
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:edit_project
echo.
echo ✏️ 編輯專案設定
echo.

REM 顯示所有專案
echo 📋 所有專案：
echo.
for /f "tokens=*" %%i in ('powershell -Command "$json = Get-Content 'github_accounts.json' | ConvertFrom-Json; $accountIndex = 0; $json.accounts | ForEach-Object { $account = $_; $projectIndex = 0; $account.projects | ForEach-Object { Write-Output \"帳戶 $($accountIndex + 1) 專案 $($projectIndex + 1): $($account.name) - $($_.name)\" ; $projectIndex++ } ; $accountIndex++ }"') do (
    echo %%i
)

echo.
set /p account_num=請選擇帳戶編號: 
set /p project_num=請選擇專案編號: 

echo.
echo 請輸入新的設定 (留空表示保持原值):
set /p edit_name=專案名稱: 
set /p edit_repo=倉庫 URL: 
set /p edit_website=網站 URL: 
set /p edit_description=專案描述: 

powershell -Command "
$json = Get-Content 'github_accounts.json' | ConvertFrom-Json
$account = $json.accounts[$account_num - 1]
$project = $account.projects[$project_num - 1]

if ($account -and $project) {
    if ('$edit_name' -ne '') { $project.name = '$edit_name' }
    if ('$edit_repo' -ne '') { $project.repository = '$edit_repo' }
    if ('$edit_website' -ne '') { $project.website = '$edit_website' }
    if ('$edit_description' -ne '') { $project.description = '$edit_description' }
    
    $json | ConvertTo-Json -Depth 4 | Set-Content 'github_accounts.json'
    Write-Output \"✅ 已更新專案設定\"
} else {
    Write-Output \"❌ 無效的帳戶或專案編號\"
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

REM 顯示所有專案
echo 📋 所有專案：
echo.
for /f "tokens=*" %%i in ('powershell -Command "$json = Get-Content 'github_accounts.json' | ConvertFrom-Json; $accountIndex = 0; $json.accounts | ForEach-Object { $account = $_; $projectIndex = 0; $account.projects | ForEach-Object { Write-Output \"帳戶 $($accountIndex + 1) 專案 $($projectIndex + 1): $($account.name) - $($_.name)\" ; $projectIndex++ } ; $accountIndex++ }"') do (
    echo %%i
)

echo.
set /p account_num=請選擇帳戶編號: 
set /p project_num=請選擇專案編號: 

powershell -Command "
$json = Get-Content 'github_accounts.json' | ConvertFrom-Json
$account = $json.accounts[$account_num - 1]

if ($account -and $project_num -le $account.projects.Count -and $project_num -gt 0) {
    $projectName = $account.projects[$project_num - 1].name
    $account.projects = $account.projects | Where-Object { $account.projects.IndexOf($_) -ne ($project_num - 1) }
    
    $json | ConvertTo-Json -Depth 4 | Set-Content 'github_accounts.json'
    Write-Output \"✅ 已刪除專案: $projectName\"
} else {
    Write-Output \"❌ 無效的帳戶或專案編號\"
}
"

echo.
echo 按任意鍵返回主選單...
pause >nul
goto main_menu

:list_all
echo.
echo 📋 所有帳戶和專案：
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

:fix_auth
echo.
echo 🔧 修復當前認證
echo.

echo 當前設定：
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
echo 👋 感謝使用 GitHub 進階專案管理工具！
echo.
pause
exit
