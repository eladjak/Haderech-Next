import dynamic from 'next/dynamic';
import React from 'react';

export const ChatbotWindow = dynamic(
  () => import('@/components/chatbot/ChatbotWindow'),
  {
    ssr: false,
    loading: () => React.createElement('div', {
      className: "fixed bottom-4 end-4 w-12 h-12 rounded-full bg-primary animate-pulse"
    })
  }
);

export const CanvasConfetti = dynamic(
  () => import('@/components/ui/confetti'),
  { ssr: false }
);

export const FramerMotionComponents = {
  Tilt: dynamic(() => import('@/components/ui/tilt'), { ssr: false }),
  Reveal: dynamic(() => import('@/components/ui/reveal'), { ssr: false }),
  Typewriter: dynamic(() => import('@/components/ui/typewriter'), { ssr: false }),
  Parallax: dynamic(() => import('@/components/ui/parallax'), { ssr: false }),
  Spotlight: dynamic(() => import('@/components/ui/spotlight'), { ssr: false }),
};

export const SimulatorComponents = {
  ChatSimulator: dynamic(() => import('@/components/simulator/ChatSimulator')),
  ScenarioSelector: dynamic(() => import('@/components/simulator/ScenarioSelector')),
};
