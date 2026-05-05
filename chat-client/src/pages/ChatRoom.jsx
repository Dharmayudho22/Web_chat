import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const SOCKET_URL = 'http://localhost:3000'

export default function ChatRoom() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [users, setUsers] = useState([])
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchRoom()
    // eslint-disable-next-line react-hooks/immutability
    fetchMessages()

    socketRef.current = io(SOCKET_URL)
    socketRef.current.emit('join_room', id)
    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socketRef.current.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRoom = async () => {
    try {
      const { data } = await api.get(`/rooms/${id}`)
      setRoom(data)
      const { data: allUsers } = await api.get('/users')
      setUsers(allUsers)
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      navigate('/dashboard')
    }
  }

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/rooms/${id}/messages`)
      setMessages(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !socketRef.current) return
    socketRef.current.emit('send_message', {
      roomId: id,
      isi: input.trim(),
      pengirimId: user.id,
    })
    setInput('')
  }

  const handleInvite = async (userId) => {
    await api.post(`/rooms/${id}/invite`, { userId })
    setShowInvite(false)
    alert('User berhasil diundang!')
  }

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    })

  const getInitials = (nama) =>
    nama?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const isCreator = room?.creator === user?.id || room?.creator === user?._id

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">

      <div className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white text-sm">
          ← Kembali
        </button>
        <span className="font-medium">
          {room?.isDM ? 'DM' : `# ${room?.nama || '...'}`}
        </span>
        {room?.isPrivate && !room?.isDM && isCreator && (
          <button onClick={() => setShowInvite(!showInvite)}
            className="ml-auto text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full">
            + Undang
          </button>
        )}
      </div>

      {showInvite && (
        <div className="absolute top-14 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-10 w-56">
          <p className="text-xs text-gray-500 mb-2">Undang user:</p>
          {users.map(u => (
            <div key={u._id} onClick={() => handleInvite(u._id)}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">
                {u.nama[0]}
              </div>
              <span className="text-sm text-gray-700">{u.nama}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm">Memuat pesan...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">
            Belum ada pesan. Mulai obrolan!
          </p>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.pengirim._id === user.id ||
                           msg.pengirim._id === user._id
            return (
              <div key={msg._id || i}
                className={`flex gap-2 items-end ${isMine ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {getInitials(msg.pengirim.nama)}
                </div>
                <div className={`flex flex-col ${isMine ? 'items-end' : ''}`}>
                  {!isMine && (
                    <span className="text-xs text-gray-500 mb-1">
                      {msg.pengirim.nama}
                    </span>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm max-w-xs break-words
                    ${isMine
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                    }`}>
                    {msg.isi}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend}
        className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ketik pesan..." />
        <button type="submit" disabled={!input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          Kirim
        </button>
      </form>
    </div>
  )
}