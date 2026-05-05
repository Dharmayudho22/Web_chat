import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.nama
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center">
      <span className="font-medium">ChatApp</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">
          Halo, <strong>{user?.nama}</strong>
        </span>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
        <button onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-white">
          Keluar
        </button>
      </div>
    </nav>
  )
}