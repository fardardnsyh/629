import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './slice/settingsSlice'

export default configureStore({
  reducer: {
    settings: settingsReducer,
  },
})