import { createSlice } from "@reduxjs/toolkit";

import type { Message, FeedbackDetails, SimulatorState, SimulatorScenario } from "@/types/simulator";

import type { PayloadAction } from "@reduxjs/toolkit";

// State model interface
interface SimulatorStateModel {
  state: SimulatorState | null;
  isLoading: boolean;
  error: string | null;
  currentScenario: SimulatorScenario | null;
  feedback: FeedbackDetails | null;
  messages: Message[];
}

// Initial state
const initialState: SimulatorStateModel = {
  state: null,
  isLoading: false,
  error: null,
  currentScenario: null,
  feedback: null,
  messages: [],
};

// Slice
const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    setState: (state: SimulatorStateModel, action: PayloadAction<SimulatorState>) => {
      state.state = action.payload;
      state.messages = action.payload.messages;
      state.currentScenario = action.payload.scenario;
      state.feedback = action.payload.feedback || null;
    },
    setLoading: (state: SimulatorStateModel, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state: SimulatorStateModel, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMessage: (state: SimulatorStateModel, action: PayloadAction<Message>) => {
      if (state.state) {
        state.state.messages.push(action.payload);
        state.messages.push(action.payload);
      }
    },
    setFeedback: (state: SimulatorStateModel, action: PayloadAction<FeedbackDetails>) => {
      if (state.state) {
        state.state.feedback = action.payload;
        state.feedback = action.payload;
      }
    },
    setCurrentScenario: (state: SimulatorStateModel, action: PayloadAction<SimulatorScenario>) => {
      state.currentScenario = action.payload;
    },
    reset: (state: SimulatorStateModel) => {
      state.state = null;
      state.isLoading = false;
      state.error = null;
      state.currentScenario = null;
      state.feedback = null;
      state.messages = [];
    },
  },
});

// Selectors
export const selectSimulatorState = (state: { simulator: SimulatorStateModel }): SimulatorState | null => state.simulator.state;
export const selectIsLoading = (state: { simulator: SimulatorStateModel }): boolean => state.simulator.isLoading;
export const selectError = (state: { simulator: SimulatorStateModel }): string | null => state.simulator.error;
export const selectCurrentScenario = (state: { simulator: SimulatorStateModel }): SimulatorScenario | null => state.simulator.currentScenario;
export const selectFeedback = (state: { simulator: SimulatorStateModel }): FeedbackDetails | null => state.simulator.feedback;
export const selectMessages = (state: { simulator: SimulatorStateModel }): Message[] => state.simulator.messages;

// Actions
export const {
  setState,
  setLoading,
  setError,
  addMessage,
  setFeedback,
  setCurrentScenario,
  reset,
} = simulatorSlice.actions;

// Reducer
export default simulatorSlice.reducer;
