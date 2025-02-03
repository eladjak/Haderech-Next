import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UIState {
  toast: Toast | null;
  isLoading: boolean;
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  currentModal: string | null;
}

const initialState: UIState = {
  toast: null,
  isLoading: false,
  isSidebarOpen: false,
  isSearchOpen: false,
  currentModal: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast: (state: UIState, action: PayloadAction<Toast>) => {
      state.toast = action.payload;
    },
    clearToast: (state: UIState) => {
      state.toast = null;
    },
    setLoading: (state: UIState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state: UIState) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleSearch: (state: UIState) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    openModal: (state: UIState, action: PayloadAction<string>) => {
      state.currentModal = action.payload;
    },
    closeModal: (state: UIState) => {
      state.currentModal = null;
    },
  },
});

export const {
  showToast,
  clearToast,
  setLoading,
  toggleSidebar,
  toggleSearch,
  openModal,
  closeModal,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
