# Pulse Mobile
Pulse v1 — Phased Execution Plan

Guiding Principles





MVP first: Ship one-to-one chat (Phases 2–4) before advanced features.



Two repos: [pulse-mobile](pulse-mobile) (frontend) and [pulse-backend](pulse-backend) (backend) only—no shared contracts package for now.



TDD from Phase 2: Every feature follows Red → Green → Refactor. Tests are written before implementation, not bolted on at the end.



Phased API strategy: REST for auth and profiles (Phases 2–3); GraphQL for chat data + Subscriptions for real-time (Phase 4+).



Backend-owned API spec: REST + GraphQL schema documented in pulse-backend/docs/; mobile mirrors shapes locally.



Learn by building: Each phase ends with a working, demoable slice—not just docs.

flowchart LR
  subgraph repos [Two Repos]
    Backend[pulse-backend]
    Mobile[pulse-mobile]
  end
  Backend -->|docs REST + GraphQL| Mobile
  Mobile -->|"REST (auth, profiles)"| Backend
  Mobile -->|"GraphQL + Subscriptions (chat)"| Backend
  Backend --> PostgreSQL[(PostgreSQL)]
  Backend --> Redis[(Redis)]
  Backend --> S3[(AWS S3)]



Learning Tracks (woven into every phase)

TDD — Test-Driven Development







When



What





Phase 1



Install test harnesses only—no feature tests yet





Phase 2+



Red → Green → Refactor for every feature





Phase 12



Advanced layer: E2E, Detox, integration tests, CI test gates

Backend TDD loop (NestJS + Jest):





Write a failing unit test for a service method (e.g. AuthService.register())



Write the minimum code to pass



Refactor; add integration test for the controller endpoint



Repeat per endpoint/mutation

Mobile TDD loop (Jest + React Native Testing Library):





Write a failing test for a component or hook (e.g. login form validation)



Implement the minimum UI/logic to pass



Refactor; add integration test for the screen flow where valuable

Test pyramid target:

        / E2E (Detox) \          ← Phase 12
       / Integration    \        ← Phases 4+
      / Unit (services, hooks) \   ← Phase 2+

GraphQL — Phased Introduction







Phase



API style



Real-time



Mobile client





2–3



REST (/api/v1/auth, /api/v1/users)



—



RTK Query





4+



GraphQL (/graphql)



GraphQL Subscriptions (Redis pub/sub)



Apollo Client





6+



GraphQL mutations for media metadata



Subscriptions for delivery status



Apollo Client

Why phased: Auth and file uploads are simpler to learn with REST first. Chat is where GraphQL shines—nested queries, cursor pagination, and subscriptions map naturally to conversation/message UX.

Phase 4 GraphQL surface (draft):

type Query {
  conversations: [Conversation!]!
  conversation(id: ID!): Conversation
  messages(conversationId: ID!, cursor: String, limit: Int): MessageConnection!
}

type Mutation {
  createConversation(participantId: ID!): Conversation!
  sendMessage(conversationId: ID!, content: String!): Message!
}

type Subscription {
  messageAdded(conversationId: ID!): Message!
  messageStatusUpdated(conversationId: ID!): MessageStatus!  # Phase 5
  typingIndicator(conversationId: ID!): TypingEvent!         # Phase 5
  presenceUpdated: PresenceEvent!                            # Phase 5
}



Phase 0 + 1 (Week 1) — Architecture + Scaffold

Phase 0 — Lightweight Architecture (2–3 days)

Keep docs minimal but decision-complete. Primary home: [pulse-backend/docs/](pulse-backend/docs/).







Deliverable



Scope for v1





PRD



One-to-one chat MVP: auth, profiles, conversation list, chat screen, real-time messages, message status (Phase 5)





User flows



Signup → Login → Conversation list → Start/select chat → Send/receive message → Logout





ER diagram



Users, RefreshTokens, Conversations, Participants, Messages





REST contracts



Auth + profile endpoints (Phases 2–3)





GraphQL schema draft



Chat queries, mutations, subscriptions (Phase 4+)





System design



REST for auth/profiles; GraphQL + Subscriptions for chat; S3 for media; Redis for pub/sub

Core ER Model (v1)

erDiagram
  Users ||--o{ RefreshTokens : has
  Users ||--o{ Participants : joins
  Conversations ||--|{ Participants : contains
  Conversations ||--o{ Messages : has
  Users ||--o{ Messages : sends

  Users {
    uuid id PK
    string email UK
    string passwordHash
    string displayName
    string avatarUrl
    datetime lastSeenAt
    datetime createdAt
  }
  RefreshTokens {
    uuid id PK
    uuid userId FK
    string tokenHash
    datetime expiresAt
  }
  Conversations {
    uuid id PK
    enum type
    datetime createdAt
  }
  Participants {
    uuid conversationId FK
    uuid userId FK
    datetime joinedAt
  }
  Messages {
    uuid id PK
    uuid conversationId FK
    uuid senderId FK
    text content
    enum type
    enum status
    datetime createdAt
  }

API Contract Surface

REST — Phases 2–3 (/api/v1)





POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout, POST /auth/forgot-password



GET /users/me, PATCH /users/me, POST /users/me/avatar (signed URL flow)

GraphQL — Phase 4+ (/graphql)





Queries: conversations, conversation, messages (cursor pagination)



Mutations: createConversation, sendMessage



Subscriptions: messageAdded (Phase 4); messageStatusUpdated, typingIndicator, presenceUpdated (Phase 5)

Where contracts live





Backend: docs/rest-api.md, docs/graphql-schema.md, DTOs (REST), code-first GraphQL types (NestJS)



Mobile: src/types/api/ (REST) + src/graphql/ (operations + generated types via GraphQL Code Generator in Phase 4)



Sync rule: Update docs before code in both repos



Phase 1 — Project Setup (3–4 days)

Repo 1: pulse-backend





Stack: NestJS, TypeScript, Prisma, PostgreSQL, Docker Compose, Jest



Modules (empty shells): auth, users, conversations, messages, graphql (added in Phase 4), prisma, config



Tooling: ESLint, Prettier, Husky, lint-staged, .env.example



Test harness: Jest + @nestjs/testing; sample smoke test; npm test in CI-ready scripts



Docker Compose: postgres:16, redis:7 (Redis used from Phase 4 for GraphQL Subscriptions pub/sub)



Health check: GET /health



Docs: docs/rest-api.md, docs/graphql-schema.md, docs/er-diagram.md, docs/system-design.md, docs/tdd-guide.md

Suggested layout:

src/
  modules/
    auth/
    users/
    conversations/
    messages/
    graphql/          # scaffolded empty; implemented Phase 4
  common/
  config/
test/                 # e2e test setup (used Phase 12)
docs/
prisma/
docker-compose.yml

Repo 2: pulse-mobile





Stack: Expo (SDK 52+), React Native, TypeScript, Jest + React Native Testing Library



Tooling: ESLint, Prettier, Husky, lint-staged



Test harness: Jest config for RN; sample component smoke test; npm test script



Navigation: Expo Router placeholders: (auth)/login, (auth)/signup, (tabs)/chats, (tabs)/profile



State prep: Redux Toolkit + RTK Query + MMKV (Phase 2); Apollo Client added Phase 4



Env: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GRAPHQL_URL (Phase 4)

Suggested layout:

app/
src/
  store/
  services/           # REST via RTK Query (Phases 2–3)
  graphql/            # Apollo Client + operations (Phase 4+)
  types/api/
  schemas/
  components/
  hooks/
  __tests__/
docs/
  API.md
  tdd-guide.md

Phase 1 exit criteria





Both repos: lint, typecheck, build, and test (smoke tests) pass



Backend starts with Docker Postgres; Prisma migrations apply



Mobile launches in Expo Go with placeholder navigation



docs/rest-api.md and docs/graphql-schema.md drafted for Phases 2–4



Subsequent Phases (Roadmap Reference)







Week



Phase



Focus



TDD scope



GraphQL





2



Phase 2 — Auth



JWT, refresh, bcrypt, MMKV



Unit tests for AuthService; integration tests for auth endpoints; mobile login form tests



REST only





3



Phase 3 — Profiles



S3 signed URLs, avatar



Profile service tests; avatar upload flow tests



REST only





4–5



Phase 4 — Core Chat



GraphQL queries/mutations/subscriptions



Resolver tests; subscription pub/sub tests; chat screen + send message tests



Introduce GraphQL + Subscriptions





6



Phase 5 — Advanced Chat



Typing, presence, read receipts



Subscription event tests



New subscription types





7



Phase 6 — Media



Images/docs/video/audio



Upload + metadata mutation tests



GraphQL mutations for media





8



Phase 7 — Push



FCM, deep links



Notification handler tests



—





9



Phase 8 — State refactor



Apollo cache, optimistic updates



Cache behavior tests



Apollo normalized cache





10



Phase 9 — Offline



Message queue, retry



Offline queue + sync tests



Optimistic mutations





11



Phase 10 — Search



Postgres FTS



Search resolver tests



GraphQL search queries





12



Phase 11 — Security/Perf



Rate limits, Redis, indexes



Security middleware tests



Query complexity limits





13



Phase 12 — Advanced Testing



Detox E2E, CI test gates



Full test pyramid; auth → chat E2E flows



GraphQL integration tests





14



Phase 13 — CI/CD



GitHub Actions, EAS Build



Tests block merge



—





15



Phase 14 — Deploy



Render/Railway + TestFlight



—



—





16



Phase 15 — Monitoring



Sentry, Firebase Analytics



—



—

Phase 4 implementation notes (GraphQL cutover):





Backend: @nestjs/graphql + Apollo Driver, code-first; Redis pub/sub for subscriptions



Mobile: @apollo/client with WebSocket link for subscriptions; GraphQL Code Generator for typed operations



REST endpoints for conversations/messages are not built—chat goes straight to GraphQL



Auth token passed via Authorization header on GraphQL HTTP + WS connection

sequenceDiagram
  participant Mobile
  participant REST as REST_API
  participant GQL as GraphQL
  participant Redis
  participant DB as PostgreSQL

  Note over Mobile,REST: Phases 2-3
  Mobile->>REST: POST /auth/login
  Mobile->>REST: PATCH /users/me

  Note over Mobile,GQL: Phase 4+
  Mobile->>GQL: query conversations
  Mobile->>GQL: mutation sendMessage
  GQL->>DB: persist message
  GQL->>Redis: publish messageAdded
  Redis->>GQL: fan out subscription
  GQL-->>Mobile: subscription messageAdded



Phase 0 + 1 Implementation Order





Create GitHub repos: pulse-mobile, pulse-backend



Write PRD + user flows in pulse-backend/docs/



Finalize ER diagram and Prisma schema



Document REST contracts (docs/rest-api.md) and GraphQL schema draft (docs/graphql-schema.md)



Write docs/tdd-guide.md in both repos (Red-Green-Refactor workflow, commands, examples)



Scaffold pulse-backend with Jest harness + Prisma



Scaffold pulse-mobile with Jest/RNTL harness + Expo Router



Verify local dev loop + npm test on both repos



Tag v0.1.0 on both repos



Key Technical Decisions (locked for v1)







Decision



Choice



Rationale





Repo layout



2 separate repos



Simpler setup; defer shared contracts package





TDD



From Phase 2 onward



Learn test-first discipline; Phase 12 adds E2E layer





Auth/profiles API



REST



Simpler entry point; industry-standard JWT flows





Chat API



GraphQL + Subscriptions



Learn queries, mutations, subscriptions on the core feature





Real-time



GraphQL Subscriptions + Redis pub/sub



Replaces Socket.IO for chat; native GraphQL learning path





Mobile REST client



RTK Query (Phases 2–3)



Already in stack; auth/profile caching





Mobile GraphQL client



Apollo Client (Phase 4+)



Standard GraphQL RN tooling; normalized cache





Backend GraphQL



NestJS code-first (@nestjs/graphql)



Type-safe resolvers alongside Prisma





Auth tokens



Access JWT (15m) + Refresh (7d, rotated)



Works for both REST and GraphQL contexts





1:1 conversation key



Unique pair of participant user IDs



Prevents duplicate 1:1 threads



Updated Final Tech Stack







Layer



Technology





Mobile



Expo, React Native, TypeScript, Redux Toolkit, RTK Query, Apollo Client, React Hook Form, Zod, MMKV





Backend



NestJS, Prisma, PostgreSQL, GraphQL (Apollo), Redis, JWT, bcrypt





Testing



Jest, React Native Testing Library, Detox (Phase 12), Supertest (backend integration)





Infra



AWS S3, Firebase FCM, Docker, GitHub Actions, Sentry



Risks and Mitigations





TDD slowdown early on: Expected—speed increases by Phase 4 as the habit forms. Keep tests focused on behavior, not implementation details.



Two API styles (REST + GraphQL): Clear boundary—REST never handles chat data; document in docs/system-design.md to avoid mixing.



GraphQL Subscriptions on mobile: Use graphql-ws protocol; test on physical device with LAN IP; fall back to polling in dev if WS is blocked.



Apollo + RTK Query coexistence: RTK Query owns auth/profile slice; Apollo owns chat slice. Phase 8 refactor unifies patterns, not necessarily the libraries.



Contracts drift: Backend docs are source of truth; add GraphQL Code Generator in Phase 4 to auto-sync mobile types from schema.



Two-repo onboarding: README in each repo with clone, env, docker-compose, and npm test instructions.



Future Options (not in v1)





Extract shared-api-contracts npm package post Phase 4 if type mirroring becomes painful



Add Socket.IO as a comparison/learning side-track (not needed for MVP)



GraphQL Federation if the backend grows multiple services

