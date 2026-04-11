import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get profile')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout')
  } catch {}
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', profileData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    accessToken: localStorage.getItem('accessToken') || null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setToken: (state, action) => { state.accessToken = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
      })
      .addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.profile = action.payload.profile
      })
      .addCase(getMe.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.profile = null; state.isAuthenticated = false; state.accessToken = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.user })
  },
})

export const { clearError, setToken } = authSlice.actions
export default authSlice.reducer
