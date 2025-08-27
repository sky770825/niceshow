# 🚀 上傳 clean-tools 到 niceshow 倉庫
# 使用方法: .\upload-to-niceshow.ps1

Write-Host "🚀 開始上傳 clean-tools 到 niceshow 倉庫" -ForegroundColor Green

# 檢查是否在正確的目錄
if (-not (Test-Path "clean-tools")) {
    Write-Host "❌ 錯誤：找不到 clean-tools 資料夾" -ForegroundColor Red
    Write-Host "請在專案根目錄執行此腳本" -ForegroundColor Yellow
    exit 1
}

# 1. 初始化 Git 倉庫（如果還沒初始化）
if (-not (Test-Path ".git")) {
    Write-Host "📋 步驟 1: 初始化 Git 倉庫..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/sky770825/niceshow.git
    Write-Host "✅ Git 倉庫初始化完成" -ForegroundColor Green
}

# 2. 複製所有文件到當前目錄
Write-Host "📋 步驟 2: 複製文件..." -ForegroundColor Yellow
Copy-Item "clean-tools\*" "." -Recurse -Force
Write-Host "✅ 文件複製完成" -ForegroundColor Green

# 3. 添加所有文件到 Git
Write-Host "📤 步驟 3: 添加文件到 Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ 文件添加完成" -ForegroundColor Green

# 4. 提交更改
Write-Host "📝 步驟 4: 提交更改..." -ForegroundColor Yellow
git commit -m "初始上傳：實用工具集 - 紗窗計算器、虛擬幣交易、身心靈測驗、自動上傳工具"
Write-Host "✅ 提交完成" -ForegroundColor Green

# 5. 推送到 GitHub
Write-Host "🚀 步驟 5: 推送到 GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main
Write-Host "✅ 推送完成" -ForegroundColor Green

# 6. 顯示結果
Write-Host "`n🎉 上傳完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📱 專案名稱: 實用工具集" -ForegroundColor White
Write-Host "🌐 主頁面: https://sky770825.github.io/niceshow/" -ForegroundColor Cyan
Write-Host "🔗 工具頁面:" -ForegroundColor Cyan
Write-Host "   • 紗窗計算器: https://sky770825.github.io/niceshow/screens-calculator.html" -ForegroundColor Cyan
Write-Host "   • 虛擬幣交易: https://sky770825.github.io/niceshow/crypto-trading.html" -ForegroundColor Cyan
Write-Host "   • 身心靈測驗: https://sky770825.github.io/niceshow/mind-body-soul-quiz.html" -ForegroundColor Cyan
Write-Host "   • 自動上傳工具: https://sky770825.github.io/niceshow/auto-upload.html" -ForegroundColor Cyan
Write-Host "⏱️  部署時間: 通常 1-5 分鐘內完成" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n✨ 現在您可以訪問上述連結使用所有工具了！" -ForegroundColor Green
Write-Host "💡 記得在 GitHub 倉庫設定中啟用 GitHub Pages" -ForegroundColor Yellow
