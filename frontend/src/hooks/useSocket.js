import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '../store/slices/notificationSlice'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const useSocket = () => {
  const dispatch = useDispatch()
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    socket = io(SOCKET_URL, { auth: { token: accessToken }, transports: ['websocket'] })

    socket.on('connect', () => console.log('Socket connected'))
    socket.on('notification', (data) => dispatch(addNotification(data)))
    socket.on('connect_error', (err) => console.error('Socket error:', err.message))

    return () => {
      if (socket) { socket.disconnect(); socket = null }
    }
  }, [isAuthenticated, accessToken])

  return socket
}

export const getSocket = () => socket
