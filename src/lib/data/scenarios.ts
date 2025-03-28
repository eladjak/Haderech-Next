import { EXAMPLE_SCENARIOS } from "@/constants/simulator";
import type { SimulatorScenario } from "@/types/simulator";

export function getScenarios(): SimulatorScenario[] {
  return EXAMPLE_SCENARIOS;
}

export function getScenarioById(id: string): SimulatorScenario | undefined {
  return EXAMPLE_SCENARIOS.find((scenario) => scenario.id === id);
}

export function getScenariosByDifficulty(
  difficulty: SimulatorScenario["difficulty"]
): SimulatorScenario[] {
  return EXAMPLE_SCENARIOS.filter(
    (scenario) => scenario.difficulty === difficulty
  );
}

export function getScenariosByCategory(category: string): SimulatorScenario[] {
  return EXAMPLE_SCENARIOS.filter((scenario) => scenario.category === category);
}
