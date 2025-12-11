import axios from 'axios'

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // If token expired (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/refresh`,
              { refreshToken }
            )
            
            if (response.data.success) {
              const { token, refreshToken: newRefreshToken } = response.data.data
              localStorage.setItem('token', token)
              localStorage.setItem('refreshToken', newRefreshToken)
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`
              return apiClient(originalRequest)
            }
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // GET request
  async get<T = any>(url: string, config?: any): Promise<any> {
    try {
      const response = await apiClient.get(url, config)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Request failed',
        data: null,
      }
    }
  },

  // POST request
  async post<T = any>(url: string, data?: any, config?: any): Promise<any> {
    try {
      const response = await apiClient.post(url, data, config)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Request failed',
        data: null,
      }
    }
  },

  // PUT request
  async put<T = any>(url: string, data?: any, config?: any): Promise<any> {
    try {
      const response = await apiClient.put(url, data, config)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Request failed',
        data: null,
      }
    }
  },

  // DELETE request
  async delete<T = any>(url: string, config?: any): Promise<any> {
    try {
      const response = await apiClient.delete(url, config)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Request failed',
        data: null,
      }
    }
  },

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: any): Promise<any> {
    try {
      const response = await apiClient.patch(url, data, config)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Request failed',
        data: null,
      }
    }
  },
}

// Export default api
export default api
