import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink, Calendar as CalendarIcon } from 'lucide-react'
import { useToast } from '../components/Toast'

export default function ScheduleManagement() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const toast = useToast()

  useEffect(() => {
    loadScheduleData()
  }, [])

  const loadScheduleData = async () => {
    setLoading(true)
    toast.info('正在載入行程資料...')
    try {
      const SHEET_ID = '1oS9zTU6DL_cCRnOI6A4ffAeXXn7fXkr6URxxMVprlG4'
      const SHEET_GID = '782323585'
      const csvURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
      
      const response = await fetch(csvURL)
      const csvText = await response.text()
      const data = parseCSV(csvText)
      
      // 按週次分組
      const groupedWeeks = groupByWeek(data)
      setWeeks(groupedWeeks)
      if (groupedWeeks.length > 0) {
        setSelectedWeek(groupedWeeks[0])
      }
      toast.success('行程資料載入成功')
    } catch (error) {
      console.error('載入行程資料失敗:', error)
      toast.error('載入行程資料失敗，請檢查 Google Sheets 設定')
    } finally {
      setLoading(false)
    }
  }

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length >= 5) {
        data.push({
          timestamp: values[0],
          storeName: values[1],
          type: values[2],
          venue: values[3],
          bookingDate: values[4],
          status: values[5] || '',
          fee: values[6] || '',
          paid: values[7] || '',
          note: values[8] || '',
        })
      }
    }
    return data
  }

  const parseCSVLine = (line) => {
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  }

  const groupByWeek = (data) => {
    // 簡單的週次分組（實際應該根據日期）
    const weeks = []
    const weekSize = 7
    for (let i = 0; i < data.length; i += weekSize) {
      const weekData = data.slice(i, i + weekSize)
      weeks.push({
        id: `week${weeks.length}`,
        title: `第 ${weeks.length + 1} 週`,
        data: weekData,
      })
    }
    return weeks
  }

  const SHEET_URL = `https://docs.google.com/spreadsheets/d/1oS9zTU6DL_cCRnOI6A4ffAeXXn7fXkr6URxxMVprlG4/edit#gid=782323585`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">餐車行程管理</h1>
          <p className="text-gray-600">管理餐車的行程安排和排班資訊</p>
        </div>
        <div className="flex space-x-3">
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ExternalLink size={18} />
            <span>開啟 Google Sheets</span>
          </a>
          <button
            onClick={loadScheduleData}
            disabled={loading}
            className="btn btn-primary flex items-center space-x-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>重新載入</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 週次列表 */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">週次列表</h2>
              <div className="space-y-2">
                {weeks.map((week) => (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week)}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg transition-all
                      ${
                        selectedWeek?.id === week.id
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <CalendarIcon size={18} />
                      <span>{week.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {week.data.length} 筆記錄
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 行程詳情 */}
          <div className="lg:col-span-3">
            {selectedWeek ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedWeek.title} - 行程詳情
                  </h2>
                  <span className="text-sm text-gray-500">
                    共 {selectedWeek.data.length} 筆
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">店名</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">類型</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">場地</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">日期</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">狀態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWeek.data.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{item.storeName || '-'}</td>
                          <td className="py-3 px-4">{item.type || '-'}</td>
                          <td className="py-3 px-4">{item.venue || '-'}</td>
                          <td className="py-3 px-4">{item.bookingDate || '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`
                                px-2 py-1 rounded text-xs font-medium
                                ${
                                  item.status === '己排班'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }
                              `}
                            >
                              {item.status || '未設定'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>提示：</strong>要編輯行程資料，請點擊「開啟 Google Sheets」按鈕直接在 Google Sheets 中編輯。
                    編輯完成後，點擊「重新載入」按鈕即可看到最新資料。
                  </p>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">請選擇一個週次查看詳情</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
