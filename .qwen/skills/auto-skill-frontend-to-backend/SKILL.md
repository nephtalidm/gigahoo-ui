---
name: frontend-to-backend
description: Generate a production-ready backend (SQL schema + API) by exhaustively extracting the data model from an existing frontend codebase.
source: auto-skill
extracted_at: '2026-06-22T02:44:44.976Z'
---

# Frontend-to-Backend Generation

When asked to create a backend for an existing frontend prototype, follow this procedure:

## Step 1: Exhaustive Frontend Exploration

Use an Explore agent to read **every** source file in the frontend project. Specifically:

- **All page files** (`app/**/page.tsx` or equivalent) — understand routes, forms, and data displayed
- **All components** — extract form fields, table columns, card layouts, modal contents
- **Data/type files** (`lib/data.ts`, `types/`, etc.) — these often contain the canonical type definitions and mock data
- **Auth flows** — login/signup forms reveal user fields, auth methods (OAuth, magic link, SMS), and session handling
- **Dashboard pages** — reveal what metrics, lists, and detail views the backend must serve
- **Settings/config pages** — reveal all editable fields per entity
- **Pricing/plan pages** — reveal subscription tiers and feature gates
- **Any existing API stubs or fetch calls** — reveal intended endpoint shapes

## Step 2: Extract the Data Model

From the exploration, produce a comprehensive inventory of:

1. **Entities** with all fields and types (e.g., User, Account, Call, Invoice)
2. **Enums/lookups** (e.g., plans, categories, statuses, countries)
3. **Relationships** (one-to-one, one-to-many)
4. **Form fields** — these define required vs optional columns
5. **Auth providers** and token flows
6. **Third-party integrations** (Stripe, Twilio, email, OAuth providers)

## Step 3: Generate SQL Schema

Create a single SQL creation script with:

- Lookup/enum tables seeded with data matching the frontend
- Core entity tables with proper types, constraints, and defaults
- Foreign keys and indexes (especially on foreign keys and common query patterns)
- Computed columns or triggers for `UpdatedAt` auto-update
- Use `IF NOT EXISTS` guards for idempotent re-runs

## Step 4: Generate API Backend

Create a production-ready API project with:

- **Entity models** matching the SQL schema exactly
- **DbContext** with fluent API configuration (indexes, relationships, filters)
- **DTOs** separating request/response shapes from entities
- **Services layer** for each external integration (auth, email, SMS, payments)
- **Controllers** organized by domain (Auth, Account, Calls, Billing, etc.)
- **Program.cs** with: structured logging (Serilog), JWT auth, rate limiting, CORS, health checks, HSTS, Swagger
- **Configuration** files for dev/production with placeholder secrets
- **Dockerfile** for containerized deployment

## Key Principles

- Match the backend data model **exactly** to what the frontend expects — field names, types, and relationships
- Use the frontend's mock data as a guide for seed data values
- Gate features behind plan tiers exactly as the frontend does
- Include webhook handlers for any third-party integrations (e.g., Stripe events)
- Production concerns: retry on DB failure, structured logging, rate limiting on auth endpoints, refresh token rotation
