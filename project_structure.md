# Project Structure

Here is the detailed folder and nested file structure of the project, excluding `node_modules`, `.next`, `.git`, and `.gitignore`.

```text
stackoverflow-appwrite/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── answer/
│   │   │   └── route.ts
│   │   └── vote/
│   │       └── route.ts
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HeroSectionHeader.tsx
│   │   ├── LatestQuestions.tsx
│   │   └── TopContributers.tsx
│   ├── questions/
│   │   ├── [quesId]/
│   │   │   └── [quesName]/
│   │   │       ├── edit/
│   │   │       │   ├── EditQues.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── DeleteQuestion.tsx
│   │   │       ├── EditQuestion.tsx
│   │   │       └── page.tsx
│   │   ├── page.tsx
│   │   └── Search.tsx
│   ├── users/
│   │   └── [userId]/
│   │       └── [userSlug]/
│   │           ├── answers/
│   │           │   └── page.tsx
│   │           ├── edit/
│   │           │   └── page.tsx
│   │           ├── questions/
│   │           │   └── page.tsx
│   │           ├── votes/
│   │           │   └── page.tsx
│   │           ├── EditButton.tsx
│   │           ├── layout.tsx
│   │           ├── Navbar.tsx
│   │           └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── magicui/
│   │   ├── animated-grid-pattern.tsx
│   │   ├── animated-list.tsx
│   │   ├── border-beam.tsx
│   │   ├── confetti.tsx
│   │   ├── icon-cloud.tsx
│   │   ├── magic-card.tsx
│   │   ├── meteors.tsx
│   │   ├── neon-gradient-card.tsx
│   │   ├── number-ticker.tsx
│   │   ├── particles.tsx
│   │   ├── retro-grid.tsx
│   │   ├── shimmer-button.tsx
│   │   ├── shine-border.tsx
│   │   └── shiny-button.tsx
│   ├── ui/
│   │   ├── background-beams.tsx
│   │   ├── button.tsx
│   │   ├── floating-navbar.tsx
│   │   ├── hero-parallax.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tracing-beam.tsx
│   │   └── wobble-card.tsx
│   ├── Answers.tsx
│   ├── Comments.tsx
│   ├── Pagination.tsx
│   ├── QuestionCard.tsx
│   ├── QuestionForm.tsx
│   ├── RTE.tsx
│   └── VoteButtons.tsx
├── lib/
│   ├── env.ts
│   └── utils.ts
├── models/
│   ├── client/
│   │   └── config.ts
│   ├── server/
│   │   ├── answer.collection.ts
│   │   ├── comment.collection.ts
│   │   ├── config.ts
│   │   ├── dbSetup.ts
│   │   ├── question.collection.ts
│   │   ├── storageSetup.ts
│   │   └── vote.collection.ts
│   ├── index.ts
│   └── name.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── store/
│   └── Auth.ts
├── utils/
│   ├── cn.ts
│   ├── relativeTime.ts
│   └── slugify.ts
├── .env
├── AGENTS.md
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── README.md
└── tsconfig.json
```
