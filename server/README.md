### Backend Service (Node + Express)

This folder contains the in-progress backend for the AI talent agent. The skeleton already wires Express, Prisma, Pino logging, and service stubs for Gmail, AI (OpenAI), and Twilio.

#### 1. Install dependencies

Copy the example file and populate credentials:

```bash
cp .env.example .env
```

Then install dependencies with your preferred package manager:

```bash
npm install
```

> The project is configured to deploy on Render using `npm`.

#### 2. Configure environment

Required before the server will boot:
- `DATABASE_URL` – PostgreSQL connection string (e.g. Render’s External Database URL).

Optional but recommended:
- `SESSION_SECRET` – random string used to sign OAuth state tokens.
- `PUBLIC_WEB_APP_URL` – where to send users after OAuth completes (defaults to JSON response).
- `OPENAI_API_KEY` – enables AI summaries and negotiation coaching.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` – for Gmail OAuth.
- `GOOGLE_PUBSUB_VERIFICATION_TOKEN` – webhook validation value.
- `SEED_CREATOR_EMAIL`, `SEED_CREATOR_NAME`, `SEED_CREATOR_PHONE` – optional defaults for `pnpm prisma:seed`.

#### 3. Initialize the database

The schema now targets PostgreSQL. Run these once against your database:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Locally you can also connect to a Postgres instance (Docker, Render, Supabase, etc.) by updating `DATABASE_URL` and re-running `npx prisma migrate deploy`.

#### 4. Run the API

```bash
npm run dev
```

The server boots on `http://localhost:4000` by default. A `GET /healthz` endpoint and `/api` namespace are already mounted.

---

### Next implementation milestones

1. **Gmail OAuth flow** – connect the frontend button to `GET /api/auth/google` and surface success/error after the callback.
2. **Pub/Sub webhook** – flesh out `src/api/routes/webhooks.ts` to parse Gmail notifications, fetch messages, and persist via Prisma.
3. **AI analysis** – replace the placeholder response in `AiService.generateDealInsights` with an OpenAI Responses call using structured output.
4. **SMS workflow** – finish the bidirectional SMS loop so creators can approve/decline deals from their phone (handle replies, retries, analytics).
5. **Workers** – schedule a cron/queue worker (BullMQ, Cloud Tasks, etc.) to renew Gmail watch channels every 7 days.

### Minimal prototype workflow (manual polling)

1. **Seed a creator** – run `pnpm prisma:seed` (or `pnpm prisma:studio` for manual entry) to ensure at least one creator exists; note the resulting `creatorId`.
2. **Connect Gmail once** – request `/api/auth/google?creatorId=<ID>&redirectUri=http://localhost:3000/oauth-callback`, open the returned `authorizationUrl`, and approve access with your inbox.
3. **Run the poller** – execute `npm run worker:gmail` to process newly arrived Gmail messages (tracked via Gmail history), classify them, store an `InboundEmail`, and text the creator with a YES/NO prompt (requires Twilio credentials + creator phone).
4. **Creator replies** – on a `YES` reply the Twilio webhook writes a `Deal` linked to the email; `NO` marks the message as declined.
5. **Repeat on demand** – run `pnpm worker:gmail` whenever you want to ingest the next unread email; later you can wrap it in a cron job or queue worker for automation.

#### Convenience dev runner

From the repository root you can launch the backend, ngrok tunnel, and recurring Gmail worker with a single command:

```bash
npm install        # once, to pull in concurrently
npm run dev:full   # starts api, ngrok, and the worker loop
```

The worker loop runs every 60 seconds by default; override with `WORKER_INTERVAL_MS=30000 npm run dev:full` if you want a shorter interval.
