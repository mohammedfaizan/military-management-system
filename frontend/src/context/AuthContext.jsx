import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const isAdmin = user?.role === "admin"
  const isCommander = user?.role === "base_commander"
  const isLogisticsOfficer = user?.role === "logistics_officer"

  const role = user?.role;

  const fetchUser = async () => {
    try {
      // Try to get user via /me
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      })
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('Access token expired. Attempting refresh...')

        try {
          // Try refresh token
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {}, {
            withCredentials: true,
          })

          // Retry fetch after refresh
          const retryRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
            withCredentials: true,
          })
          setUser(retryRes.data.user)
          localStorage.setItem('user', JSON.stringify(retryRes.data.user))
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr)
          setUser(null)
          localStorage.removeItem('user')
        }
      } else {
        console.error('Fetch user error:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      })
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoggedIn: !!user,
      loading,
      isAdmin,
      isCommander,
      isLogisticsOfficer,
      role
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
