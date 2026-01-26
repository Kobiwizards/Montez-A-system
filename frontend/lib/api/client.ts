import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    // Use environment-specific API URL
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    
    console.log('API Client initialized with baseURL:', this.baseURL)
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        // If token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await axios.post(`${this.baseURL}/auth/refresh-token`, {
                refreshToken,
              })
              
              console.log('Refresh token response:', response.data)
              
              // Handle backend response format: { success: true, token, refreshToken }
              if (response.data.success) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data
                
                if (newToken) {
                  this.setToken(newToken)
                  localStorage.setItem('refreshToken', newRefreshToken)
                  
                  // Update the failed request with new token
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
                  return this.client(originalRequest)
                }
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            this.clearAuth()
            window.location.href = '/login'
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  // Generic request method - SIMPLIFIED
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request(config)
      
      console.log('API Request completed:', {
        url: config.url,
        method: config.method,
        status: response.status
      })
      
      // Return the full response data
      return response.data as T
    } catch (error: any) {
      console.error('API request failed:', error)
      console.error('Request URL:', config.url)
      console.error('Base URL:', this.baseURL)
      
      // Handle error response format from backend
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          throw new Error(errorData.message)
        }
        if (errorData.success === false && errorData.message) {
          throw new Error(errorData.message)
        }
      }
      
      throw new Error('Network error. Please check your connection.')
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // File upload helper
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // File download helper
  async download(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    })
    return response.data
  }
}

export const api = new ApiClient()