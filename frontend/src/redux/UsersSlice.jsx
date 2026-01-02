import { createSlice } from "@reduxjs/toolkit";

export const UsersSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    fetchUser: (state, action) => {
      // Assuming the action payload contains user data
      state.user = action.payload;
    },
  },
});

export const { login, logout, updateUser, fetchUser } = UsersSlice.actions;

// Selector for fetching the userId
export const selectUserId = (state) =>
  state.user.user ? state.user.user._id : null;

export const selectUser = (state) => state.user.user;

export default UsersSlice.reducer;
