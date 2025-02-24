/**
 * @file simulator.ts
 * @description Constants and default values for the simulator module
 *
 * This file provides centralized configuration for simulator scenarios,
 * feedback criteria, and default values used throughout the simulator features.
 */

import { SimulatorScenario } from "@/types/simulator";

/**
 * Scenario types for the simulator
 * Used to categorize different simulation scenarios
 */
export const SCENARIO_TYPES = {
  BASIC: "basic",
  ADVANCED: "advanced",
  EXPERT: "expert",
  CLASSROOM: "classroom",
  DISCUSSION: "discussion",
  BEHAVIOR: "behavior",
} as const;

/**
 * Feedback criteria for evaluating user responses in simulations
 * These criteria are used to provide structured feedback on performance
 */
export const FEEDBACK_CRITERIA = {
  EMPATHY: "empathy",
  CLARITY: "clarity",
  EFFECTIVENESS: "effectiveness",
  APPROPRIATENESS: "appropriateness",
  PROFESSIONALISM: "professionalism",
  PROBLEM_SOLVING: "problem_solving",
} as const;

/**
 * Default values for feedback components
 * Used when the AI analysis doesn't provide specific feedback elements
 */
export const DEFAULT_FEEDBACK = {
  COMMENTS: [
    "Your response shows good understanding of the situation.",
    "There are some aspects that could be improved.",
    "Consider different approaches to similar situations in the future.",
  ],
  SUGGESTIONS: [
    "Practice active listening techniques",
    "Focus on clear communication",
  ],
  TIPS: [
    "Remember to acknowledge emotions",
    "Stay positive and solution-oriented",
  ],
  STRENGTHS: ["Good communication", "Clear expression of ideas"],
  IMPROVEMENTS: [
    "Could show more empathy",
    "Could provide more specific guidance",
  ],
};

/**
 * Example scenario for classroom management
 * Provides a structured simulation for handling classroom situations
 */
export const CLASSROOM_MANAGEMENT_SCENARIO: SimulatorScenario = {
  id: "classroom-1",
  title: "Classroom Disruption",
  description: "Handle a student who is disrupting the class",
  difficulty: "intermediate",
  category: SCENARIO_TYPES.CLASSROOM,
  initial_message:
    "You are teaching a math lesson when a student starts talking loudly to their classmates, disrupting the flow of the lesson. How do you respond?",
  context:
    "You're teaching a 7th grade math class with 25 students. This particular student has been disruptive before.",
  objectives: [
    "Address the disruption without escalating the situation",
    "Maintain classroom focus",
    "Treat the student with respect",
  ],
  expected_outcomes: [
    "The student stops the disruptive behavior",
    "The class returns to the lesson",
    "The student feels heard rather than punished",
  ],
  max_turns: 5,
  time_limit: 600,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Example scenario for facilitating discussions
 * Provides a structured simulation for managing group discussions
 */
export const DISCUSSION_FACILITATION_SCENARIO: SimulatorScenario = {
  id: "discussion-1",
  title: "Group Discussion Facilitation",
  description: "Facilitate a discussion where opinions are divided",
  difficulty: "advanced",
  category: SCENARIO_TYPES.DISCUSSION,
  initial_message:
    "You're leading a discussion about a controversial topic, and the group is divided with strong opinions on both sides. Several participants are becoming visibly frustrated. How do you facilitate this discussion?",
  context:
    "You're facilitating a professional development workshop for teachers discussing teaching methods.",
  objectives: [
    "Ensure all voices are heard",
    "De-escalate tension",
    "Guide the discussion productively",
    "Maintain a respectful environment",
  ],
  expected_outcomes: [
    "Participants feel their perspectives were respected",
    "The discussion remains constructive despite differences",
    "Key insights are identified from multiple perspectives",
  ],
  max_turns: 7,
  time_limit: 900,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Example scenario for behavior management
 * Provides a structured simulation for handling challenging behaviors
 */
export const BEHAVIOR_MANAGEMENT_SCENARIO: SimulatorScenario = {
  id: "behavior-1",
  title: "Handling Defiant Behavior",
  description: "Respond to a student refusing to follow instructions",
  difficulty: "expert",
  category: SCENARIO_TYPES.BEHAVIOR,
  initial_message:
    "A student is refusing to participate in a group activity and has said, 'This is stupid, I'm not doing it.' Other students are watching how you'll respond. What do you do?",
  context:
    "This is a high school classroom, and the student has been struggling with engagement recently.",
  objectives: [
    "Address the refusal appropriately",
    "Minimize disruption to other students",
    "Understand potential underlying causes",
    "Maintain the student's dignity",
  ],
  expected_outcomes: [
    "The student eventually participates or accepts an alternative",
    "The classroom dynamic remains positive",
    "The student feels respected despite the behavioral issue",
  ],
  max_turns: 6,
  time_limit: 720,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Collection of example scenarios for use throughout the application
 * These are used for demo purposes and as templates for creating new scenarios
 */
export const EXAMPLE_SCENARIOS: SimulatorScenario[] = [
  CLASSROOM_MANAGEMENT_SCENARIO,
  DISCUSSION_FACILITATION_SCENARIO,
  BEHAVIOR_MANAGEMENT_SCENARIO,
  // Basic scenario example
  {
    id: "basic-1",
    title: "Basic Communication",
    description: "Practice basic communication with a student",
    difficulty: "beginner",
    category: SCENARIO_TYPES.BASIC,
    initial_message:
      "A student approaches you after class and says they're having trouble understanding the material. How do you respond?",
    context:
      "You're teaching a 9th grade science class. This student typically performs well but has been struggling recently.",
    objectives: [
      "Show empathy towards the student",
      "Identify ways to support their learning",
      "Build a positive teacher-student relationship",
    ],
    expected_outcomes: [
      "The student feels supported",
      "Clear next steps are established",
      "The student's confidence improves",
    ],
    max_turns: 4,
    time_limit: 300,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Advanced scenario example
  {
    id: "advanced-1",
    title: "Parent Conference",
    description: "Navigate a challenging parent-teacher conference",
    difficulty: "advanced",
    category: SCENARIO_TYPES.ADVANCED,
    initial_message:
      "You're meeting with a parent who is upset about their child's recent grade on a major project. The parent begins by saying, 'My child worked very hard on this and deserves a better grade.' How do you handle this conversation?",
    context:
      "The student received a C on a project that was worth 20% of their final grade. The rubric was provided in advance.",
    objectives: [
      "Maintain a professional demeanor",
      "Explain your grading decisions clearly",
      "Listen to the parent's concerns",
      "Find a constructive path forward",
    ],
    expected_outcomes: [
      "The parent understands the grading rationale",
      "The conversation remains respectful",
      "A plan is developed to support the student",
    ],
    max_turns: 6,
    time_limit: 600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
