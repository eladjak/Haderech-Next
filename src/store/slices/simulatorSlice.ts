import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SimulatorState as SimState, SimulatorAction } from '@/types/models';

interface SimulatorState {
  state: SimState;
  actions: SimulatorAction[];
  currentStep: number;
  isRunning: boolean;
  speed: number;
  error: string | null;
}

const initialState: SimulatorState = {
  state: {
    registers: {},
    memory: {},
    flags: {},
    programCounter: 0
  },
  actions: [],
  currentStep: 0,
  isRunning: false,
  speed: 1,
  error: null
};

export const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<SimState>) => {
      state.state = action.payload;
    },
    setActions: (state, action: PayloadAction<SimulatorAction[]>) => {
      state.actions = action.payload;
      state.currentStep = 0;
    },
    step: (state) => {
      if (state.currentStep < state.actions.length) {
        state.currentStep += 1;
      }
    },
    reset: (state) => {
      state.currentStep = 0;
      state.state = initialState.state;
      state.isRunning = false;
    },
    setRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setState,
  setActions,
  step,
  reset,
  setRunning,
  setSpeed,
  setError
} = simulatorSlice.actions;

export default simulatorSlice.reducer; 