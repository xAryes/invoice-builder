import { useRef, useState, useEffect, useCallback } from 'react'
import { Trash2, Upload, Pencil } from 'lucide-react'

export const SignatureCanvas = ({ value, onChange, label = 'Signature' }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mode, setMode] = useState(value ? 'preview' : 'draw') // 'draw', 'upload', 'preview'
  const [hasDrawn, setHasDrawn] = useState(false)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  // Load existing signature
  useEffect(() => {
    if (value && mode === 'preview') {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = value
    }
  }, [value, mode])

  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback((e) => {
    if (mode !== 'draw') return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasDrawn(true)
  }, [mode, getCoordinates])

  const draw = useCallback((e) => {
    if (!isDrawing || mode !== 'draw') return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing, mode, getCoordinates])

  const stopDrawing = useCallback(() => {
    if (isDrawing && mode === 'draw') {
      setIsDrawing(false)
    }
  }, [isDrawing, mode])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onChange('')
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return

    const dataUrl = canvas.toDataURL('image/png')
    onChange(dataUrl)
    setMode('preview')
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 200 * 1024) {
      alert('Image must be less than 200KB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      onChange(event.target?.result)
      setMode('preview')
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    clearCanvas()
    setMode('draw')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {mode === 'preview' && value ? (
        <div className="relative">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
            <img
              src={value}
              alt="Signature"
              className="h-20 w-auto object-contain mx-auto"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Draw new
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mode tabs */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`text-xs px-3 py-1.5 rounded-md transition ${
                mode === 'draw'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Pencil className="w-3 h-3 inline mr-1" />
              Draw
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`text-xs px-3 py-1.5 rounded-md transition ${
                mode === 'upload'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Upload className="w-3 h-3 inline mr-1" />
              Upload
            </button>
          </div>

          {mode === 'draw' && (
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white cursor-crosshair touch-none"
                style={{ height: '120px' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
                {hasDrawn && (
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="text-xs text-gray-900 dark:text-white font-medium hover:underline"
                  >
                    Save signature
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Draw your signature above using mouse or touch
              </p>
            </div>
          )}

          {mode === 'upload' && (
            <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
              <Upload className="w-5 h-5" />
              <span className="text-sm">Upload signature image (max 200KB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          )}
        </>
      )}
    </div>
  )
}
