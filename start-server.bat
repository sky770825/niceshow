@echo off
echo ====================================
echo 啟動本地開發伺服器
echo ====================================
echo.
echo 正在啟動伺服器...
echo 請在瀏覽器中開啟: http://localhost:8000
echo.
echo 按 Ctrl+C 停止伺服器
echo.
npx http-server -p 8000 -c-1 --cors
pause

