# Contributing to HaDerech

Thank you for your interest in contributing to HaDerech! This document provides guidelines and instructions for contributing to our educational platform.

## Educational Mission

Our mission is to create an engaging, effective learning platform that helps people improve their relationships and communication skills. When contributing, keep in mind:

- Focus on user learning experience
- Maintain educational integrity
- Support diverse learning styles
- Ensure content accuracy
- Promote positive engagement

## Development Setup

1. **Prerequisites**

   - Node.js 18+
   - pnpm
   - Git
   - Understanding of educational principles

2. **Local Setup**

   ```bash
   git clone https://github.com/your-username/haderech.git
   cd haderech
   pnpm install
   pnpm dev
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in the required values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key
   ```

## Development Workflow

1. **Branch Naming**

   - Feature: `feature/description`
   - Bug fix: `fix/description`
   - Documentation: `docs/description`
   - Performance: `perf/description`
   - Content: `content/description`
   - Learning: `learn/description`

2. **Commit Messages**
   Follow conventional commits:

   ```
   feat: add new learning module
   fix: improve feedback clarity
   docs: update learning guides
   content: add relationship scenarios
   learn: enhance exercise flow
   ai: improve response quality
   ```

3. **Code Style**

   - Use TypeScript
   - Follow ESLint rules
   - Format with Prettier
   - Write JSDoc comments
   - Use meaningful variable names
   - Keep functions small and focused
   - Add educational context in comments

4. **Testing**

   - Write unit tests for components
   - Test learning effectiveness
   - Validate AI responses
   - Check accessibility
   - Test different learning paths

   ```bash
   pnpm test
   pnpm test:e2e
   pnpm test:ai
   ```

5. **Documentation**
   - Update technical docs
   - Document learning flows
   - Add usage examples
   - Include educational context
   - Update learning guides

## Educational Guidelines

1. **Content Creation**

   - Focus on clear learning objectives
   - Support multiple learning styles
   - Provide meaningful feedback
   - Include practical examples
   - Consider cultural sensitivity

2. **AI Integration**

   - Ensure response quality
   - Maintain educational value
   - Check for bias
   - Support learning goals
   - Monitor effectiveness

3. **User Experience**

   - Clear learning paths
   - Intuitive navigation
   - Meaningful feedback
   - Progress tracking
   - Engagement features

4. **Accessibility**
   - Support all learners
   - Clear instructions
   - Alternative formats
   - Language support
   - Cultural inclusion

## Component Guidelines

1. **Learning Components**

   - Clear purpose
   - Consistent structure
   - Progress tracking
   - Feedback mechanisms
   - Accessibility support

2. **UI Components**

   - Follow design system
   - Support RTL
   - Implement proper types
   - Add accessibility
   - Consider learning context

3. **Performance**
   - Quick response times
   - Efficient loading
   - Smooth interactions
   - Resource optimization
   - Learning flow priority

## Testing Guidelines

1. **Educational Testing**

   ```typescript
   describe("LearningModule", () => {
     it("should provide clear feedback", () => {
       // Test implementation
     });
     it("should track progress correctly", () => {
       // Test implementation
     });
   });
   ```

2. **AI Testing**

   - Response quality
   - Learning effectiveness
   - Safety and appropriateness
   - Performance metrics
   - User satisfaction

3. **User Testing**
   - Learning outcomes
   - User engagement
   - Accessibility
   - Cultural fit
   - Technical performance

## Review Process

1. **Code Review**

   - Technical quality
   - Educational value
   - User experience
   - Performance impact
   - Security considerations

2. **Content Review**

   - Educational accuracy
   - Cultural sensitivity
   - Language clarity
   - Learning effectiveness
   - User engagement

3. **AI Review**
   - Response quality
   - Safety checks
   - Performance metrics
   - Learning impact
   - User feedback

## Deployment

1. **Testing Environment**

   - Feature validation
   - Learning flow testing
   - Performance checks
   - AI validation
   - User testing

2. **Production**
   - Staged rollout
   - Monitoring setup
   - Feedback collection
   - Performance tracking
   - Learning analytics

## Need Help?

- Check documentation
- Join our Discord
- Review learning guides
- Ask in discussions
- Contact mentors

Thank you for contributing to better education! 🎓
