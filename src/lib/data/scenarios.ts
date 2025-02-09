import type { SimulationScenario } from "@/types/simulator";

import { EXAMPLE_SCENARIOS } from "@/constants/simulator";

export function getScenarios(): SimulationScenario[] {
  return EXAMPLE_SCENARIOS;
}

export function getScenarioById(id: string): SimulationScenario | undefined {
  return EXAMPLE_SCENARIOS.find((scenario) => scenario.id === id);
}

export function getScenariosByDifficulty(
  difficulty: SimulationScenario["difficulty"],
): SimulationScenario[] {
  return EXAMPLE_SCENARIOS.filter(
    (scenario) => scenario.difficulty === difficulty,
  );
}

export function getScenariosByCategory(category: string): SimulationScenario[] {
  return EXAMPLE_SCENARIOS.filter((scenario) => scenario.category === category);
}
