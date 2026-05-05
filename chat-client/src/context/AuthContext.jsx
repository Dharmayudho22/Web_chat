import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    // ambil dari localStorage kalau sudah pernah login
    JSON.parse(localStorage.getItem('user')) || null
  )

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook — pakai ini di setiap komponen yang butuh data user
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)