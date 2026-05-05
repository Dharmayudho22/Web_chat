import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data } = await api.post('/auth/login', form)
            login(data.user, data.token)
            navigate('/dashboard')
        }catch (err) {
            setError(err.response?.data?.error || 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-8 w-full max-w-sm border border-gray-200">
                <h1 className="text-xl font-medium text-center mb-1">Selamat datang</h1>
                <p className="text-gray-500 text-center mb-6">Masuk ke akun kamu</p>

                {error && (
                    <div className="bg-red-50 border boreder-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="budi@mail.com" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Password kamu" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Memproses..' : 'Masuk'}
                    </button>
                </form>

                <p className="text-sm text-center mt-4 text-gray-500">
                    Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">Daftar</Link>
                </p>
            </div>
        </div>
    )
}