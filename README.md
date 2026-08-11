# RiverFlow 🌊

RiverFlow is a premium, developer-focused Q&A platform built for speed, clean aesthetics, and interactive learning. Modeled after legacy developer forums like StackOverflow, RiverFlow is reimagined with a modern dark theme, smooth micro-animations, real-time database reactivity, user reputation systems, and intuitive markdown editing.

---

## 🎯 Purpose

Modern developer forums often feel cluttered, slow, and visually outdated. **RiverFlow** bridges the gap by delivering a highly responsive, modern, and engaging community workspace.

Beyond being a developer-facing application, RiverFlow serves as an architectural pattern showcase for:

- Building **Next.js (App Router)** apps combined with **Appwrite** as a Backend-as-a-Service (BaaS).
- Demonstrating proper segregation of server-side Node SDK logic and client-side Web SDK capabilities.
- Achieving performance optimization through React Server Components (RSC) and dynamic client-side caching.
- Creating premium visual interfaces using custom shaders, canvas particle animations, and glassmorphism styling.

---

## 🛠️ Tech Stack & Badges

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  </a>
  <a href="https://appwrite.io/">
    <img src="https://img.shields.io/badge/Appwrite-FD366E?style=for-the-badge&logo=appwrite&logoColor=white" alt="Appwrite" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://zustand-demo.pmnd.rs/">
    <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  </a>
</p>

### Technologies Used

| Technology                | Symbol | Role in Application                                                                                   |
| :------------------------ | :----: | :---------------------------------------------------------------------------------------------------- |
| **Next.js (v15+)**        |   🌐   | Server-side rendering (SSR), React Server Components (RSC), API routes, and Turbopack bundler.        |
| **Appwrite BaaS**         |   🔥   | Handles user authentication, database collections, storage bucket files, and user preference presets. |
| **Tailwind CSS**          |   🎨   | Core styling engine supplying HSL utility-first colors and modular design constraints.                |
| **TypeScript**            |   🛡️   | Complete static typing coverage protecting component boundaries and database document shapes.         |
| **Zustand**               |   📦   | Lightweight client-side store maintaining active session contexts and local auth user profiles.       |
| **Aceternity & Magic UI** |   ✨   | Canvas particles, shimmering components, background laser grids, and confetti animations.             |

---

## 📐 Detailed Architecture

RiverFlow is divided cleanly into local client scopes and secure server scopes to assure fast data load times without compromising security.

```mermaid
graph TD
    %% Client Tier
    subgraph Client ["Client Tier (Browser)"]
        UI[React View / Components]
        Store[Zustand Auth Store]
        AppwriteClientSDK[Appwrite Web SDK]
    end

    %% NextJS Server Tier
    subgraph NextServer ["Next.js Server Tier"]
        RSC[React Server Components]
        API[API Route Handlers]
        AppwriteServerSDK[node-appwrite Admin SDK]
    end

    %% Storage & Database Backend
    subgraph AppwriteBaaS ["Appwrite Backend Cloud"]
        AuthDB[Appwrite Auth Service]
        Database[(Appwrite Databases)]
        Storage[(Appwrite Storage)]
    end

    %% Connections
    UI <--> Store
    UI -- Auth Transactions --> AppwriteClientSDK
    AppwriteClientSDK <--> AuthDB

    RSC -- Direct Read-only queries --> AppwriteServerSDK
    API -- Read/Write database operations --> AppwriteServerSDK
    UI -- Fetch requests --> API
    AppwriteServerSDK <--> Database
    AppwriteServerSDK <--> Storage
```

### Data Fetching & Sync Flow

1. **Read Request (RSC)**: When loading a page like `/questions/[quesId]`, Next.js invokes Appwrite's server-side Node SDK directly with full credentials, skipping client roundtrips. Data is cleaned (`JSON.parse(JSON.stringify)`) and streamed down directly as raw HTML/React elements.
2. **Interactive States**: Voting and comments are handled client-side by sending POST/DELETE requests to local Next.js Route Handlers (`/api/vote`, `/api/answer`).
3. **Reputation Updates**: When a new answer is created or deleted, Next.js API routes securely fetch the author's preferences from Appwrite's User administration API, adjust the reputation score, and persist it server-side.
4. **File Handling**: Questions can upload files directly via the client to the Appwrite Storage bucket. The detail page uses the server-side API key configuration to dynamically serve original raw resources using `getFileView()`.

---

## 🗄️ Database Schemas

RiverFlow utilizes four Appwrite collections managed under a single Database entity (`db`):

### 1. `Questions` Collection

- Stores user-created queries.
  | Attribute Name | Type | Key Details |
  | :--- | :--- | :--- |
  | `title` | String | Title of the question. |
  | `content` | String (Markdown) | Extended body text detailing the problem. |
  | `authorId` | String | Relates to the Appwrite User account ID. |
  | `tags` | String Array | Dynamic list of technology tag labels. |
  | `attachmentId` | String | Refers to the uploaded image in Appwrite Storage. |

### 2. `Answers` Collection

- Stores responses to questions.
  | Attribute Name | Type | Key Details |
  | :--- | :--- | :--- |
  | `content` | String (Markdown) | Body text of the answer. |
  | `questionId` | String | References the parent `Questions` document ID. |
  | `authorId` | String | References the Appwrite User account ID. |

### 3. `Comments` Collection

- Holds comments on either questions or answers.
  | Attribute Name | Type | Key Details |
  | :--- | :--- | :--- |
  | `content` | String | Plaintext comment message. |
  | `type` | Enum (`question`, `answer`) | Denotes comment parent type. |
  | `typeId` | String | References target document ID. |
  | `authorId` | String | References Appwrite User account ID. |

### 4. `Votes` Collection

- Prevents double-voting and aggregates scores.
  | Attribute Name | Type | Key Details |
  | :--- | :--- | :--- |
  | `type` | Enum (`question`, `answer`) | Denotes voted target type. |
  | `typeId` | String | References target document ID. |
  | `voteStatus` | Enum (`upvoted`, `downvoted`) | Up or down indicator. |
  | `votedById` | String | References voting user's ID. |

---

## 📝 Software Prerequisites

Before initializing RiverFlow, please make sure your local development workspace contains:

- **Node.js**: `v18.17.0` or higher (tested with active LTS versions).
- **Package Manager**: `npm` v9+ or equivalent (`yarn` / `pnpm`).
- **Appwrite Instance**: An active account on [Appwrite Cloud](https://cloud.appwrite.io) or a locally running self-hosted Appwrite setup.
- **Git**: Installed for cloning and source configuration.

---

## 🚀 Getting Started

### 1. Configuration Settings

Rename or create a `.env` file in the root directory:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
APPWRITE_API_KEY="YOUR_SECRET_API_KEY_WITH_DB_AND_STORAGE_PERMISSIONS"
```

### 2. Startup Commands

Install libraries and run the live reloading bundler:

```bash
# Clone the repository
git clone https://github.com/your-username/riverflow.git

# Enter workspace
cd riverflow

# Install project libraries
npm install

# Start Local Developer Server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) inside your web browser. Database structures and file storage buckets will configure automatically on startup.
