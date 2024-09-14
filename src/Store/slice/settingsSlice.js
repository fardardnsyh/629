import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    city: {
      name: "",
      lat: 0,
      lon: 0
    },
    calcMethod: "MuslimWorldLeague",
    loading: true,
}


export const getCity = createAsyncThunk(
    'settings/getCity',
    async () => {
        const res = JSON.parse(localStorage.getItem("city"));
        return res;
});

export const setCity = createAsyncThunk(
    'settings/setCity',
    async (city) => {
        localStorage.setItem("city",JSON.stringify(city));
        return city;
});

export const getCalcMethod = createAsyncThunk(
  'settings/getCalcMethod',
  async () => {
      const res = localStorage.getItem("calcMethod");
      return res;
});

export const setCalcMethod = createAsyncThunk(
  'settings/setCalcMethod',
  async (calcMethod) => {
      localStorage.setItem("calcMethod",calcMethod);
      return calcMethod;
});
  
export const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder

      //getCity
      .addCase(getCity.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCity.fulfilled, (state, action) => {
        state.city = action.payload || "";
        state.loading = false;
      })
      .addCase(getCity.rejected, (state, action) => {
        state.loading = false;
      })

      //setCity
      .addCase(setCity.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(setCity.fulfilled, (state, action) => {
        state.city = action.payload || "";
        state.loading = false;
      })
      .addCase(setCity.rejected, (state, action) => {
        state.loading = false;
      })

      //getCalcMethod
      .addCase(getCalcMethod.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCalcMethod.fulfilled, (state, action) => {
        if(action.payload) state.calcMethod = action.payload;
        state.loading = false;
      })
      .addCase(getCalcMethod.rejected, (state, action) => {
        state.loading = false;
      })

      //setCalcMethod
      .addCase(setCalcMethod.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(setCalcMethod.fulfilled, (state, action) => {
        state.calcMethod = action.payload || "";
        state.loading = false;
      })
      .addCase(setCalcMethod.rejected, (state, action) => {
        state.loading = false;
      })
      
    },
});

export default settingsSlice.reducer;