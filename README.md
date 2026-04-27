# AI Virtual Patient Simulator Backend

Backend API for a virtual patient simulator that supports:

- case discovery
- session creation
- patient conversation
- diagnosis evaluation
- optional Gemini-powered patient replies
- optional Supabase persistence
- faculty analytics endpoints
- structured clinical analysis output

This backend is intentionally dependency-light and runs on Node.js only, so it is easy to start during a hackathon.

## Run the API

You can keep your config in environment variables. A sample is provided in `.env.example`.
The backend also auto-loads `.env` and `.env.local` from the project root.

Set your Gemini key first:

```powershell
$env:GEMINI_API_KEY="your_key_here"
```

Default model:

- `gemini-3-pro-preview`

Optional model override:

```powershell
$env:GEMINI_MODEL="gemini-3-pro-preview"
```

If you want persistent storage with Supabase, also set:

```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

Then start the API:

```powershell
node server.js
```

The API starts on `http://localhost:3000` by default.

Storage mode:

- If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, the backend uses Supabase
- Otherwise it falls back to in-memory storage

## Supabase Setup

1. Create a Supabase project
2. Open the SQL editor
3. Run the schema from `supabase/schema.sql`
4. Copy your project URL
5. Copy your service role key
6. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment
7. Start the backend

Important:

- Use the service role key only on the backend
- Do not expose it in the frontend
- `ADMIN_API_KEY` is optional, but recommended if you expose admin endpoints publicly

You can change the port with:

```powershell
$env:PORT=4000
node server.js
```

## API Endpoints

### `GET /health`

Returns backend status.

It also reports the current storage mode.

### `GET /api/admin/analytics`

Returns:

- total sessions
- evaluated sessions
- average score
- case breakdown
- recent sessions

If `ADMIN_API_KEY` is set, pass it as the `x-admin-key` header.

### `GET /api/admin/sessions?limit=20`

Returns recent sessions for faculty/admin review.

If `ADMIN_API_KEY` is set, pass it as the `x-admin-key` header.

### `GET /api/cases`

Returns all available virtual patient cases.

### `GET /api/cases/:caseId`

Returns one case by ID.

### `POST /api/sessions`

Creates a new training session.

Request body:

```json
{
  "caseId": "case-1",
  "learnerName": "Sara"
}
```

### `GET /api/sessions/:sessionId`

Returns full session state including messages and latest evaluation.

### `POST /api/sessions/:sessionId/messages`

Sends a learner question and gets the patient reply.

Request body:

```json
{
  "message": "How long have you had the fever and cough?"
}
```

Response note:

- If `GEMINI_API_KEY` is configured, replies come from Gemini
- If not, the backend falls back to local scripted patient logic

### `POST /api/sessions/:sessionId/evaluate`

Evaluates the learner's diagnosis and reasoning.

Request body:

```json
{
  "diagnosis": "Community acquired pneumonia",
  "reasoning": "Fever, cough, pleuritic pain, and shortness of breath suggest pneumonia."
}
```

Response note:

- If Gemini is configured, evaluation feedback prefers Gemini output with local rubric fallback
- If Gemini is not configured, evaluation uses the built-in rubric only
- Evaluation now includes likely diagnosis, differentials, red flags, missed expected questions, recommended tests, and communication guidance

## Suggested Frontend Flow

1. Call `GET /api/cases`
2. Let the user choose a case
3. Call `POST /api/sessions`
4. Render returned starter messages
5. For every learner question call `POST /api/sessions/:sessionId/messages`
6. When the learner submits diagnosis call `POST /api/sessions/:sessionId/evaluate`
7. Optionally refresh with `GET /api/sessions/:sessionId`

## Project Structure

- `server.js` - HTTP server and routing
- `src/data/cases.js` - virtual patient case bank
- `src/services/simulator.js` - patient reply and evaluation logic
- `src/services/gemini.js` - Gemini API integration
- `src/storage/` - persistence adapters for memory and Supabase
- `.env.example` - sample runtime configuration
- `api-examples.http` - ready-made API requests for testing
- `supabase/schema.sql` - database schema for sessions, messages, and evaluations
- `Dockerfile` - container deployment setup
- `render.yaml` - Render deployment config

## Outside Integrations You Can Add Later

This backend is a good base for external integrations:

- OpenAI or Azure OpenAI
- Gemini
  Already supported through `GEMINI_API_KEY`
- Supabase
  Already supported for persistent session storage
- Speech services
  Add speech-to-text and text-to-speech for voice consultations
- Database
  Persist sessions in PostgreSQL, Supabase, MongoDB, or Firebase
- Authentication
  Add student and faculty login with Clerk, Auth0, or Firebase Auth
- LMS integration
  Push scores and session reports into Moodle or Canvas
- Clinical content review
  Add faculty-authored rubrics and validated case content

## Recommended Next Backend Step

If you want, the best next version is:

1. Finish Supabase live configuration
2. Restore live Gemini usage by fixing project quota/billing
3. Add authentication and role separation
4. Add case authoring and admin tools
5. Add faculty dashboards on top of the analytics endpoints

## Deploy Notes

You can deploy this backend to platforms like Render or Railway.

Minimum env vars for a stronger hosted setup:

- `PORT`
- `NODE_ENV`
- `ALLOWED_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_KEY`

## Production Hardening Included

The backend now includes:

- request IDs through `x-request-id`
- stricter input validation
- basic rate limiting on write/admin endpoints
- controlled CORS through `ALLOWED_ORIGIN`
- no-store responses and safer security headers
- admin endpoint protection with `ADMIN_API_KEY`
- environment-aware error details

## Production Roadmap

### Phase 1: Built Now

- backend API with Supabase persistence
- patient simulation with Gemini fallback handling
- structured clinical analysis output
- differential diagnoses
- red-flag tracking
- expected history-question tracking
- recommended test suggestions
- communication goals and observations
- faculty analytics endpoints

### Phase 2: Data Collection

This part is not something code alone can finish. You need:

- more clinical cases across specialties
- faculty-reviewed transcripts
- expert scoring labels
- red-flag labels
- communication quality labels

### Phase 3: Model Tuning / Evaluation Model

Once you have reviewed data, you can train or fine-tune an evaluator model for:

- scoring
- differential ranking
- red-flag detection
- communication feedback

### Phase 4: Production AI Layer

At this stage you can deploy:

- a stronger patient simulator model
- a specialized evaluator model
- human review and audit workflow

## Model Options

You asked whether you can use Gemini or another secure and strong model. Yes.

Good options:

- Gemini
  Strong multimodal ecosystem, good managed API option
- OpenAI GPT models
  Strong reasoning and structured output support
- Azure OpenAI
  Good enterprise/security posture for production environments
- Anthropic Claude
  Strong long-context analysis and safety-oriented behavior
- Self-hosted open-weight models through secure infrastructure
  Better control, but much more operational work

Recommendation:

- for hackathon to MVP: Gemini, OpenAI, or Azure OpenAI
- for stricter enterprise deployment: Azure OpenAI or a well-governed private deployment
- for custom training later: fine-tune the evaluator layer, not the full patient simulator first
