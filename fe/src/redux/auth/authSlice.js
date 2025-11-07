// authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("access_token");

const initialState = {
  user: token ? jwtDecode(token) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("access_token");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
