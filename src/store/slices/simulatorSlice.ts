import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SimulationScenario } from '@/models/types';

interface SimulatorState {
  scenarios: SimulationScenario[];
  currentScenario: SimulationScenario | null;
  userProgress: Record<string, {
    completed: boolean;
    score: number;
    feedback: string[];
  }>;
  isLoading: boolean;
  error: string | null;
}

const initialState: SimulatorState = {
  scenarios: [],
  currentScenario: null,
  userProgress: {},
  isLoading: false,
  error: null,
};

export const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    setScenarios: (state, action: PayloadAction<SimulationScenario[]>) => {
      state.scenarios = action.payload;
      state.error = null;
    },
    setCurrentScenario: (state, action: PayloadAction<SimulationScenario | null>) => {
      state.currentScenario = action.payload;
      state.error = null;
    },
    updateProgress: (state, action: PayloadAction<{
      scenarioId: string;
      completed: boolean;
      score: number;
      feedback: string;
    }>) => {
      const { scenarioId, completed, score, feedback } = action.payload;
      if (!state.userProgress[scenarioId]) {
        state.userProgress[scenarioId] = {
          completed: false,
          score: 0,
          feedback: [],
        };
      }
      state.userProgress[scenarioId].completed = completed;
      state.userProgress[scenarioId].score = score;
      state.userProgress[scenarioId].feedback.push(feedback);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    resetCurrentScenario: (state) => {
      if (state.currentScenario) {
        const scenarioId = state.currentScenario.id;
        state.userProgress[scenarioId] = {
          completed: false,
          score: 0,
          feedback: [],
        };
      }
    },
  },
});

export const {
  setScenarios,
  setCurrentScenario,
  updateProgress,
  setLoading,
  setError,
  resetCurrentScenario,
} = simulatorSlice.actions;

export default simulatorSlice.reducer; 