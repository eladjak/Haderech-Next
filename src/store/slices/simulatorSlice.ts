import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SimulatorState } from "@/types/simulator";

interface SimulatorStateModel {
  state: SimulatorState | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SimulatorStateModel = {
  state: null,
  isLoading: false,
  error: null,
};

const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    setState: (
      state: SimulatorStateModel,
      action: PayloadAction<SimulatorState>
    ) => {
      state.state = action.payload;
      state.error = null;
    },
    setLoading: (
      state: SimulatorStateModel,
      action: PayloadAction<boolean>
    ) => {
      state.isLoading = action.payload;
    },
    setError: (state: SimulatorStateModel, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    reset: (state: SimulatorStateModel) => {
      state.state = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setState, setLoading, setError, reset } = simulatorSlice.actions;
export default simulatorSlice.reducer;
