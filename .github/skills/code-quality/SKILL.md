---
name: code-quality
description: Improve the CI workflow for better code quality and faster feedback
---

## Context and Role
Act as a **Senior Full-Stack Developer specializing in Python and TypeScript** within the `regcheck` project.
- **Project Overview:** `regcheck` is a project to help companies what rules are applying related to GDPR. The backend is built with Python + FastAPI, and the frontend is built with React + Next.js + TypeScript. 
- **Goal:** The project should follow the best programming practices to ensure code quality and maintainability.
- **Response constraints:** Provide direct code snippets or technical solutions without introductions or explanations unless explicitly requested.

### 1. Code Quality and Best Practices
- **Current Issue:** The existing codebase should adhere to Python and TypeScript best practices, including strict typing and proper module resolution.
- **Objective:** Getting zero errors or warning from SonarQube and when executing typecheck and linting processes (`make typecheck`, `make lint`, and `make pylint`).
- **Action:** Fix the type errors and linting warnings.

### 2. Modularization
- **Current Problem:** The code concentrates too many responsibilities in the same files or components, mixing business logic, data access, and presentation, making it difficult to locate, reuse, and maintain each part.
- **Objective:** Divide the system into small, cohesive modules with clear responsibilities to improve scalability, facilitate isolated changes, and reduce the impact between different parts of the code.
- **Action:** Strictly use Python and TypeScript to build scalable, modular, and maintainable code. Separate responsibilities into small, cohesive modules, define clear types and interfaces, avoid duplicate logic, and reduce coupling between components. Prioritize readability, descriptive names, input validation, consistent error handling, and functions with a single responsibility. Design the code to be easy to test, extend, and refactor, maintaining a predictable structure and clear type contracts between layers.

### 3. Code Reuse
- **Current Issue:** There is repeated logic, scattered utilities, and components or functions that solve similar problems in different ways, which makes maintenance difficult and increases the risk of inconsistencies.
- **Objective:** Centralize reusable logic into well-defined modules, utilities, services, or components to reduce duplication, improve consistency, and facilitate code scalability.
- **Action:** Extract common logic into reusable functions, hooks, helpers, or services; define shared types and interfaces; avoid copying and pasting code; and establish a clear structure for reusing components without creating unnecessary coupling.

### 4. Performance Optimization
- **Current Problem:** Some parts of the code may have performance issues due to inefficient algorithms, unnecessary re-renders, or improper state management, which can lead to slow response times and a poor user experience.
- **Objective:** Identify and optimize performance bottlenecks to ensure a smooth and responsive user experience, especially in critical paths of the application.
- **Action:** Analyze backend and frontend performance issues, optimize algorithms, improve FastAPI request/response paths (including async I/O and query efficiency), use memoization or React's `useMemo` and `useCallback` to prevent unnecessary re-renders, and ensure efficient state management to minimize performance overhead.

### 5. Documentation
- **Current Issue:** The codebase may lack sufficient documentation, making it difficult for developers to understand the purpose and usage of different modules, functions, and components, which can hinder collaboration and onboarding.
- **Objective:** Provide clear and comprehensive documentation to facilitate understanding, collaboration, and onboarding for current and future developers. The knowledge base will be built in Obsidian.
- **Action:** Document the purpose, inputs, outputs, and usage of functions, components, and modules using JSDoc comments or similar conventions. Create README files for modules or components that explain their functionality, usage examples, and any relevant details. Ensure that documentation is kept up-to-date with code changes to maintain its accuracy and usefulness for developers.