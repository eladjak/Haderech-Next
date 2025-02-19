import React from "react";

import type { SimulatorScenario } from "@/types/simulator";

interface ChatHeaderProps {
  scenario: SimulatorScenario;
}

export function ChatHeader({ scenario }: ChatHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div>
        <h2 className="text-lg font-semibold">{scenario.title}</h2>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </div>
    </div>
  );
}
