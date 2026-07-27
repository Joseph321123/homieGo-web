import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import {
  fetchConversation,
  fetchConversations,
  getApiErrorMessage,
  sendMessage,
} from '../services/api'

const MessagesPage = () => {
  const { token, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('reserva') || ''

  const [conversations, setConversations] = useState([])
  const [conversation, setConversation] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadConversations = async () => {
    const response = await fetchConversations(token)
    setConversations(response.data)
  }

  const loadConversation = async (reservationId) => {
    const response = await fetchConversation(token, reservationId)
    setConversation(response.data)
  }

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        setLoading(true)
        setError('')
        await loadConversations()
      } catch {
        if (active) setError('No pudimos cargar tus mensajes.')
      } finally {
        if (active) setLoading(false)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    if (!selectedId) {
      setConversation(null)
      return
    }

    loadConversation(selectedId).catch(() => {
      setError('No pudimos abrir esta conversación.')
    })
  }, [selectedId, token])

  const handleSelect = (reservationId) => {
    setSearchParams({ reserva: String(reservationId) })
  }

  const handleSend = async (event) => {
    event.preventDefault()
    if (!selectedId || !message.trim()) return

    setSending(true)
    setError('')
    try {
      await sendMessage(token, selectedId, message)
      setMessage('')
      await Promise.all([loadConversation(selectedId), loadConversations()])
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos enviar el mensaje'))
    } finally {
      setSending(false)
    }
  }

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Comunicación</span>
            <h1 className="section-title">Mensajes</h1>
            <p className="page-subtitle">
              Chatea con huéspedes o anfitriones sobre tus reservaciones.
            </p>
          </div>
        </div>

        {loading && <p className="state-message">Cargando conversaciones...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && conversations.length === 0 && (
          <p className="state-message">
            Aún no tienes conversaciones. Reserva una propiedad para empezar a chatear.
          </p>
        )}

        {!loading && conversations.length > 0 && (
          <div className="messages-layout">
            <aside className="panel-card conversations-list">
              <h2 className="panel-title">Conversaciones</h2>
              <div className="stack" style={{ marginTop: '1rem' }}>
                {conversations.map((item) => (
                  <button
                    key={item.reservation_id}
                    type="button"
                    className={`conversation-item${
                      String(item.reservation_id) === selectedId ? ' conversation-item-active' : ''
                    }`}
                    onClick={() => handleSelect(item.reservation_id)}
                  >
                    <div className="conversation-item-header">
                      <strong>{item.property_title}</strong>
                      {item.unread_count > 0 && (
                        <span className="nav-badge">{item.unread_count}</span>
                      )}
                    </div>
                    <span className="card-meta">
                      Con {item.other_user_name} · {item.city}
                    </span>
                    <span className="conversation-preview">
                      {item.last_message || 'Sin mensajes aún'}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="panel-card chat-panel">
              {!selectedId && (
                <p className="panel-text">Selecciona una conversación para ver los mensajes.</p>
              )}

              {selectedId && conversation && (
                <>
                  <div className="chat-header">
                    <h2 className="panel-title">{conversation.reservation.property_title}</h2>
                    <p className="card-meta">
                      Huésped: {conversation.reservation.guest_name} · Anfitrión:{' '}
                      {conversation.reservation.host_name}
                    </p>
                  </div>

                  <div className="chat-messages">
                    {conversation.messages.length === 0 && (
                      <p className="panel-text">Escribe el primer mensaje de esta conversación.</p>
                    )}
                    {conversation.messages.map((item) => {
                      const isMine = item.sender_id === user?.id
                      return (
                        <div
                          key={item.id}
                          className={`chat-bubble${isMine ? ' chat-bubble-mine' : ''}`}
                        >
                          <strong>{item.sender_name}</strong>
                          <p>{item.message}</p>
                          <span className="card-meta">
                            {new Date(item.sent_at).toLocaleString('es-MX')}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <form className="chat-form" onSubmit={handleSend}>
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      required
                    />
                    <button className="button" type="submit" disabled={sending}>
                      {sending ? 'Enviando...' : 'Enviar'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default MessagesPage
