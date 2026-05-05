import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [rooms, setRooms]       = useState([])
  const [users, setUsers]       = useState([])
  const [tab, setTab]           = useState('publik')
  const [showModal, setShowModal] = useState(false)
  const [newRoom, setNewRoom]   = useState({ nama: '', deskripsi: '', isPrivate: false })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchRooms()
    // eslint-disable-next-line react-hooks/immutability
    fetchUsers()
  }, [])

  const fetchRooms = async () => {
    const { data } = await api.get('/rooms')
    setRooms(data)
  }

  const fetchUsers = async () => {
    const { data } = await api.get('/users')
    setUsers(data)
  }

  const handleJoin = async (roomId) => {
    // eslint-disable-next-line no-unused-vars, no-empty
    try { await api.post(`/rooms/${roomId}/join`) } catch (_) {}
    navigate(`/rooms/${roomId}`)
  }

  const handleDM = async (userId) => {
    const { data } = await api.post(`/rooms/dm/${userId}`)
    navigate(`/rooms/${data._id}`)
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    await api.post('/rooms', newRoom)
    setShowModal(false)
    setNewRoom({ nama: '', deskripsi: '', isPrivate: false })
    fetchRooms()
  }

  const publik  = rooms.filter(r => !r.isPrivate && !r.isDM)
  const privat  = rooms.filter(r => r.isPrivate && !r.isDM)
  const dmRooms = rooms.filter(r => r.isDM)

  const getDMName = (room) => {
    const other = room.allowedUsers?.find(u => u._id !== user.id && u._id !== user._id)
    return other?.nama || 'DM'
  }

  const activeRooms = tab === 'publik' ? publik : tab === 'privat' ? privat : dmRooms

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {['publik','privat','dm'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                  ${tab === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                {t === 'publik' ? `Publik (${publik.length})`
                  : t === 'privat' ? `Privat (${privat.length})`
                  : `DM (${dmRooms.length})`}
              </button>
            ))}
          </div>
          {tab !== 'dm' && (
            <button onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              + Buat Room
            </button>
          )}
        </div>

        {tab === 'dm' ? (
          <div>
            <p className="text-sm text-gray-500 mb-3">Mulai DM dengan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {users.map(u => (
                <div key={u._id}
                  className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:border-blue-300"
                  onClick={() => handleDM(u._id)}>
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                    {u.nama[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{u.nama}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
            {dmRooms.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-3">DM sebelumnya:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dmRooms.map(r => (
                    <div key={r._id} onClick={() => navigate(`/rooms/${r._id}`)}
                      className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:border-blue-300">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium">
                        {getDMName(r)[0]}
                      </div>
                      <div className="font-medium text-sm">{getDMName(r)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeRooms.map(room => (
              <div key={room._id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-medium text-sm">#</div>
                  {room.isPrivate && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Privat</span>}
                </div>
                <h2 className="font-medium text-gray-900 mb-1">{room.nama}</h2>
                <p className="text-xs text-gray-500 mb-4 flex-1">{room.deskripsi || 'Tidak ada deskripsi'}</p>
                <button onClick={() => handleJoin(room._id)}
                  className="w-full bg-blue-50 text-blue-600 border border-blue-200 rounded-lg py-1.5 text-sm hover:bg-blue-100">
                  Masuk
                </button>
              </div>
            ))}
            {activeRooms.length === 0 && (
              <p className="text-gray-400 text-sm col-span-3">Belum ada room di kategori ini</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="font-medium text-lg mb-4">Buat Room Baru</h2>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input value={newRoom.nama} placeholder="Nama room" required
                onChange={e => setNewRoom({...newRoom, nama: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
              <input value={newRoom.deskripsi} placeholder="Deskripsi (opsional)"
                onChange={e => setNewRoom({...newRoom, deskripsi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={newRoom.isPrivate}
                  onChange={e => setNewRoom({...newRoom, isPrivate: e.target.checked})}/>
                Room privat (hanya undangan)
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Batal</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm">Buat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}