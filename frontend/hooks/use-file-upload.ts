import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

interface UploadFile {
  file: File
  preview: string
  name: string
  size: number
  type: string
  error?: string
}

interface UploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  maxFiles?: number
}

export function useFileUpload(options: UploadOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFiles = 5
  } = options

  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Validate single file
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      }
    }

    return { valid: true }
  }, [allowedTypes, maxSize])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    setError(null)
    
    const fileArray = Array.from(selectedFiles)
    
    // Check max files
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newFiles: UploadFile[] = []

    fileArray.forEach(file => {
      const validation = validateFile(file)
      
      if (validation.valid) {
        // Create preview for images
        const preview = file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : ''

        newFiles.push({
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
        })
      } else {
        setError(validation.error || 'File validation failed')
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles, validateFile])

  // Remove file
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const removed = newFiles.splice(index, 1)[0]
      
      // Revoke object URL to prevent memory leak
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      
      return newFiles
    })
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
    setError(null)
  }, [files])

  // Upload files to server
  const uploadFiles = useCallback(async (endpoint: string, fieldName: string = 'files') => {
    if (files.length === 0) {
      setError('No files to upload')
      return { success: false, error: 'No files to upload' }
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setError(null)

      const formData = new FormData()
      
      files.forEach(file => {
        formData.append(fieldName, file.file)
      })

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        }
      })

      if (response.success) {
        // Clear files after successful upload
        clearFiles()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Upload failed')
        return { success: false, error: response.message || 'Upload failed' }
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed')
      return { success: false, error: error.message || 'Upload failed' }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [files, clearFiles])

  // Upload single file with additional data
  const uploadWithData = useCallback(async (
    endpoint: string, 
    data: Record<string, any>, 
    fieldName: string = 'file'
  ) => {
    if (files.length === 0) {
      setError('No file to upload')
      return { success: false, error: 'No file to upload' }
    }

    if (files.length > 1) {
      setError('Multiple files not supported for this operation')
      return { success: false, error: 'Multiple files not supported' }
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setError(null)

      const formData = new FormData()
      formData.append(fieldName, files[0].file)
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string)
        }
      })

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        }
      })

      if (response.success) {
        clearFiles()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Upload failed')
        return { success: false, error: response.message || 'Upload failed' }
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed')
      return { success: false, error: error.message || 'Upload failed' }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [files, clearFiles])

  // Get total size of all files
  const getTotalSize = useCallback(() => {
    return files.reduce((total, file) => total + file.size, 0)
  }, [files])

  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    files,
    uploading,
    uploadProgress,
    error,
    totalSize: getTotalSize(),
    formatFileSize,
    handleFileSelect,
    removeFile,
    clearFiles,
    uploadFiles,
    uploadWithData,
  }
}
