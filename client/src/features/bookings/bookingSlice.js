import { createSlice } from "@reduxjs/toolkit";
const bookingSlice = createSlice({
  name: "bookings",
  initialState: { list: [], current: null, loading: false, pagination: null },
  reducers: {
    setBookings: (state, action) => { state.list = action.payload.data; state.pagination = action.payload.pagination; },
    setCurrentBooking: (state, action) => { state.current = action.payload; },
    updateBooking: (state, action) => {
      const idx = state.list.findIndex(b => b._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
      if (state.current?._id === action.payload._id) state.current = action.payload;
    },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});
export const { setBookings, setCurrentBooking, updateBooking, setLoading: setBookingLoading } = bookingSlice.actions;
export default bookingSlice.reducer;
