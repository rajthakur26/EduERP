import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const markAsRead = createAsyncThunk('notifications/markRead', async (id) => {
  await api.put(`/notifications/${id}/read`)
  return id
})

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.put('/notifications/read-all')
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0, isLoading: false },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
      state.unread += 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications
        state.unread = action.payload.unread
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload)
        if (n && !n.isRead) { n.isRead = true; state.unread = Math.max(0, state.unread - 1) }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true)); state.unread = 0
      })
  },
})

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
