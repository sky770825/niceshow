import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ placeholder = '搜索...', onSearch, value: controlledValue, onChange: controlledOnChange }) {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const setValue = isControlled ? controlledOnChange : setInternalValue

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch?.(newValue)
  }

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="input pl-10 pr-10"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
