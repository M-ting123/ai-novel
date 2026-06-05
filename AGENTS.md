# AGENTS.md

## 0. Mandatory Reading Rule

Before starting any task in this project, read and follow this `AGENTS.md` file.

This file defines the project workflow, AI collaboration rules, MVP constraints, PR rules, and skill usage rules.

Every time this file is modified, clearly tell the user:

- What changed
- Why it changed
- Which section changed

Do not silently modify this file.

## 1. Project Context

This is a 72h competition MVP project.

Do not over-design.
Prefer a monolithic application.
Prefer the fewest dependencies possible.
All features must run and be demoable locally.
Only do one PR at a time.
Any new directory, dependency, or abstraction layer must have a clear reason.
If the user, as a beginner, cannot clearly explain a design, do not use that design.

The goal is not to build a perfect large-scale system. The goal is to build a runnable, understandable, demoable project with clear user value, clean documentation, and a stable core flow.

Prioritize:

1. Clear problem definition
2. Small but complete MVP
3. Runnable local demo
4. Understandable code
5. Good README
6. Clear Git and PR workflow

Avoid:

1. Over-engineering
2. Large rewrites
3. Unnecessary architecture complexity
4. Features that cannot be finished within 72 hours
5. Code changes that the user cannot understand or explain

## 2. Skill Usage Rules

Use the following project skills when relevant.

### 2.1 `grill-me`

When the user says:

> 用 grill-me 问我这个项目

Critically challenge the project idea.

Focus on:

- Is the user pain real?
- Is the target user specific enough?
- Is the solution too generic?
- Is this just an AI wrapper?
- Can the MVP be demonstrated clearly?
- What would judges question?
- What is the weakest part of the idea?
- What should be cut or strengthened?

Ask questions one at a time. For each question, provide a recommended answer.

The goal is not to discourage the user. The goal is to expose weak points early and make the project stronger.

### 2.2 `project-planning`

When the user says:

> 用 project-planning 做项目规划

Plan the project before coding.

Focus on:

- Requirement analysis
- Target users
- User pain points
- Core scenario
- Product positioning
- MVP feature scope
- Technical route
- Development phase breakdown
- Risk points
- What should be done first

Do not jump directly into coding unless the user explicitly asks.

### 2.3 `mvp-builder`

When the user says:

> 用 mvp-builder 压 MVP 范围

Reduce the project scope to something that can be finished and demonstrated within 72 hours.

Focus on:

- Must-have features
- Should-have features
- Later features
- What to cut
- What to simplify
- What can be mocked or manually handled
- What is the smallest complete demo flow

Always prefer a simple runnable MVP over a beautiful but unfinished system.

When a feature is complex, propose a simpler fallback first.

### 2.4 `pr-workflow`

When the user says:

> 用 pr-workflow 准备一个 PR（它原本偏 Jira 工作流，有些规则不完全适合你这个 72h 项目。实际使用时我会保留它的“小 PR、分支、改动总结、测试方式、PR 描述”核心，弱化 Jira 那部分。）

Prepare the work as a small PR.

The original `pr-workflow` skill may be closer to a Jira workflow. For this 72h project, weaken the Jira-related parts and keep the useful core:

- Small PR
- Clear branch name
- One PR only does one focused thing
- Change summary
- Test method
- PR description

For each PR, provide:

1. Branch name
2. PR title
3. Feature description
4. Implementation summary
5. Changed files
6. Test method
7. Risk or notes
8. PR description draft

Do not create huge PRs that mix unrelated changes.

## 3. Small PR Workflow

When the user proposes a requirement that may change code, documentation, configuration, or project files, do not immediately write code.

First turn the requirement into one small PR.

Before implementation:

1. Ask at most 3 key questions.
2. Only ask key questions that affect module boundaries, technical route, data structure, user flow, or acceptance criteria.
3. Treat small questions that do not affect module boundaries or acceptance results as default assumptions.
4. Clearly write all default assumptions.
5. Output:
   - What this PR does
   - What this PR does not do
   - Suggested acceptance criteria
   - Which files are expected to change
6. Wait for user confirmation before implementing.

Valid confirmation signals include:

- `确认`
- `开始`
- `按这个做`
- Any clear instruction from the user to implement the proposed PR

For simple questions that do not require file changes, answer directly without forcing the PR workflow.

Definitions:

- Key question: a question that affects module boundaries, technical route, data structure, user flow, or acceptance criteria. Key questions must be asked before implementation.
- Small question: a question that does not affect module boundaries or acceptance results. Small questions can be handled with default assumptions, but the assumptions must be written clearly.
- What this PR does: the functional scope and user-visible result of this small PR, not just the module name.

Example:

- Weak: "This PR adds an upload module."
- Better: "This PR adds a `.txt` novel upload entry. After the user selects a `.txt` file, the page shows the file name and a text preview."

## 4. Acceptance Criteria Rule

Acceptance criteria means:

> What action the user performs, and what result the system shows.

The user does not need to write acceptance criteria. The AI should generate them, and the user only needs to confirm whether they match the intended effect.

Example: if the user says "我要做小说上传功能", convert it into acceptance criteria like:

1. The user can upload a `.txt` file.
2. After upload succeeds, the page shows the file name.
3. The page shows a preview of the text content.
4. When the user uploads a non-`.txt` file, the page shows an error message.
5. Upload failure does not crash the page.

Example: if the user says "我要做 AI 转 YAML", convert it into acceptance criteria like:

1. The user can input at least three chapters of novel text and click "Generate Script YAML".
2. The system returns YAML that matches the expected schema.
3. The YAML includes core fields such as `characters`, `scenes`, `dialogues`, and `actions`.
4. When generation fails, the page shows an error message.
5. The user can copy the generated result.

If the user's requirement is too vague, ask first. If reasonable defaults are enough to continue, explicitly write those default assumptions.

Key rule:

> 如果我的需求太模糊，你必须先追问；如果可以用合理默认值继续，你必须明确写出你的默认假设。

## 5. Implementation Rules

During implementation:

- Do not rewrite the whole project unless the user explicitly asks.
- Do not delete, rename, or move important files without confirmation.
- Do not introduce unnecessary dependencies.
- Do not add complex architecture just to look professional.
- Keep changes focused on the confirmed PR scope.
- Keep the project simple, runnable, and understandable.

## 6. Delivery Format After Implementation

After implementation, always output the result in this format.

### 6.1 Changed Files

List every changed file:

- What changed in this file
- Why it changed

### 6.2 How To Confirm It Runs

Include:

- Start command
- Manual test steps
- Input content
- Expected result
- Whether tests were actually run
- If tests were not run, explain why

### 6.3 PR Title And Description

All PR output text must use exactly these four Chinese sections:

1. 标题：一句话说明本 PR 新增或修改了什么。
2. 功能描述：说明该功能的作用与使用方式。
3. 实现思路：简要说明技术选型或核心实现逻辑。
4. 测试方式：说明如何验证该功能正常运行。

PR titles and descriptions must be clear, complete, and written in Chinese.

If the user needs to create the GitHub PR manually in the browser, remind the user outside the four-section PR text and provide the four-section PR text to paste.

## 7. MVP Priority Rules

This project must always follow MVP-first thinking.

Priority order:

1. Core user flow works
2. Demo can be shown
3. README explains the value clearly
4. Code is understandable
5. UI is acceptable
6. Extra features come last

If a feature is risky or too large, propose a simpler fallback.

If time is limited, protect the demo flow first.

## 8. Communication Rules

When explaining plans, risks, and project decisions to the user, use clear Chinese.

When writing code, file names, branch names, commit messages, function names, and technical identifiers, use clear English.

Be direct and practical.

If something is uncertain, say it clearly. Do not pretend to know.

If the user's idea is too large, too vague, or not suitable for 72 hours, point it out directly and suggest a smaller version.

## 9. Git and PR Rules

Use small, focused changes.

Each PR should only do one thing.

Recommended branch naming:

- `feature/xxx`
- `fix/xxx`
- `docs/xxx`
- `chore/xxx`

Each PR should include:

- What problem this PR solves
- What changed
- How to test
- Any known limitations

The main branch should stay runnable.

Do not merge broken or untested changes into main.

## 10. Documentation Rules

The README should eventually explain:

- What this project is
- Who it is for
- What problem it solves
- Core features
- Tech stack
- How to run
- Demo flow
- Project structure
- Development or PR record if needed

Documentation is part of the project, not an afterthought.

For a 72h competition project, a clear README can strongly improve the perceived quality of the project.

## 11. Final Principle

This project should be built like a real but small product.

Do not optimize for looking complicated.

Optimize for:

- Clear user value
- Fast implementation
- Stable demo
- Explainable decisions
- Small PRs
- Clean documentation

When in doubt, choose the simpler path that helps the user finish and present the project.
