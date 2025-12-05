"use client"

import { useState, useCallback } from 'react'
import { Upload, X, FileText, Image, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  accept?: string
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  accept = 'image/*,.pdf',
  multiple = true,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      
      const droppedFiles = Array.from(e.dataTransfer.files)
      const newFiles = [...files, ...droppedFiles].slice(0, maxFiles)
      
      setFiles(newFiles)
      onFilesChange(newFiles)
    },
    [files, maxFiles, onFilesChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      const newFiles = [...files, ...selectedFiles].slice(0, maxFiles)
      
      setFiles(newFiles)
      onFilesChange(newFiles)
    },
    [files, maxFiles, onFilesChange]
  )

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
      onFilesChange(newFiles)
    },
    [files, onFilesChange]
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-secondary-700 hover:border-primary/50"
        )}
      >
        <div className="max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Payment Proof</h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop your M-Pesa screenshots or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, PDF (Max {maxFiles} files)
            </p>
          </div>

          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept={accept}
              multiple={multiple}
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                asChild
              >
                <span>Choose Files</span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({files.length}/{maxFiles})</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiles([])
                onFilesChange([])
              }}
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary-800/50 border border-secondary-700"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            <span>Files ready for upload. Click submit to proceed.</span>
          </div>
        </div>
      )}
    </div>
  )
}