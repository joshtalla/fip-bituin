# Current Website Status

Date: 2026-04-29

## Scope

This document records the current state of the website after implementing the previously recommended fixes, running the app locally, probing the API, building the client, and checking the main routes in the browser.

## Environment Verified

- Server running at `http://localhost:3000`
- Client running at `http://localhost:5174`
- Client production build completes successfully
- Supabase environment variables resolve correctly in both client and server

## Executive Summary

The major wiring gaps from the previous scan have been addressed.

- The prompt board now fetches today’s prompt from the backend.
- The star grid now has a live backend endpoint for prompt-specific posts.
- Post detail pages are implemented and backed by a real API route.
- Protected routing is active for prompt, search, create-post, and post-detail pages.
- Signup now carries location and language into the user-profile creation flow.
- `/profile` and `/explore` have been hidden from the shipped navigation and now redirect away instead of exposing placeholders.

The main remaining product gap is search. It is still UI-only and does not query the backend.

## Verified Backend Status

### Working endpoints

- `GET /api/health` returns a healthy response.
- `GET /api/prompts/today` returns a real prompt from the backend.
- `GET /api/prompts/archive` returns archived prompts from the backend.
- `GET /api/prompts/:promptId/posts` returns live posts for a prompt.
- `GET /api/posts/:id` returns a single live post.
- `POST /api/posts` still rejects unauthenticated requests with `401`.

### Backend fixes applied

- The posts service now reads the `users` table using `auth_user_id` rather than assuming the auth UUID is stored in `users.id`.
- Post creation now maps `users.username` into `posts.anonymous_name` and stores the correct `users.id` in `posts.user_id`.

## Auth Status

### What is implemented

- The app initializes auth state through Supabase session lookup on load.
- The app subscribes to auth state changes.
- The auth context now looks up profiles using `users.auth_user_id`.
- If a logged-in user has no matching profile row yet, the client attempts to create it from auth metadata.
- Protected routing is active through `ProtectedRoute.jsx`.
- Anonymous access to `/prompts` now redirects to `/login`.
- Login and signup are guest-only routes and redirect away for authenticated users.

### Persistence assessment

- Session persistence logic remains in place through `getSession()` and `onAuthStateChange()`.
- The route-protection layer now actually uses that auth state.
- Full end-to-end persistence with a newly created browser user was not completely validated because Supabase signup hit rate limiting during runtime testing.

## Page-by-Page Status

### `/login`

Status: Wired and guarded as a guest-only page

- Renders correctly.
- Submits credentials through Supabase `signInWithPassword`.
- Uses the protected-route redirect target when returning a user to the page they originally requested.

### `/signup`

Status: Wired, with runtime signup limited by Supabase throttling during test

- Renders correctly.
- Form validation is present.
- Submits credentials through Supabase `signUp`.
- Location and language are now carried into auth metadata and the user-profile creation path.
- Runtime validation hit Supabase email validation and then rate limiting while testing with throwaway accounts, so a clean successful browser signup was not completed during this pass.

### `/prompts`

Status: Protected and wired to live prompt data

- Anonymous access redirects to `/login`.
- The page now fetches today’s prompt from `GET /api/prompts/today`.
- The mock prompt fallback has been removed.
- The browser-side protected flow was confirmed up to the login redirect.
- The signed-in browser render was not directly observed during this pass because signup/login credentials were unavailable after rate limiting.

### `/prompts?showSearch=1`

Status: Protected, but search is still placeholder UI

- Route remains available to authenticated users.
- Search input is still visual only.
- No search request is sent to the backend or Supabase.

### Star grid on `/prompts`

Status: Wired to backend

- The client now fetches prompt-specific posts from `GET /api/prompts/:promptId/posts`.
- The server endpoint returns real data.
- The mock post dataset has been removed from the active page path.

### `/prompts/create`

Status: Protected and backend-connected

- Anonymous access is blocked by route protection.
- Publish uses the active Supabase session token and posts to `POST /api/posts`.
- The page now disables publishing when no prompt id is present.
- Direct entry is still allowed, but it shows a warning because it depends on prompt context from the board.

### `/prompts/:postId`

Status: Implemented and backend-connected

- The route now loads a real post via `GET /api/posts/:id`.
- It also attempts to load the matching prompt for page context.
- This resolves the previous dead end after publishing and the previous broken star-grid links.

### `/profile`

Status: Hidden from shipped navigation

- The unfinished page is no longer exposed through the main nav.
- The route now redirects away instead of shipping placeholder UI as a first-class destination.

### `/explore`

Status: Hidden from shipped navigation

- The unfinished page is no longer exposed through the main nav.
- The route now redirects away instead of shipping placeholder UI as a first-class destination.

### Fallback routes

Status: Working as fallback only

- Unknown routes still render the Not Found page.
- Post-detail routes no longer rely on the Not Found page.

## Data Wiring Summary

### Properly wired today

- Client login to Supabase auth
- Client signup to Supabase auth
- Client profile creation fallback to the `users` table
- Server prompt retrieval from Supabase
- Server prompt-post retrieval from Supabase
- Server post-detail retrieval from Supabase
- Client prompt board to live prompt endpoint
- Client star grid to live post endpoint
- Client post detail page to live post endpoint
- Client post creation request to Express backend
- Backend auth validation for post creation
- Protected routing on authenticated app pages

### Still incomplete today

- Search does not query any backend or Supabase data source
- `/prompts/create` still relies on prompt context from the board for the best experience
- End-to-end browser validation of a fresh signup/login flow was limited by Supabase signup throttling during testing

## Current Risks

1. Search still looks available in the UI but is not actually wired.
2. The create-post page still has a weaker direct-entry experience when opened without prompt context.
3. Auth persistence is implemented and now used, but a full successful new-user browser validation was blocked by Supabase rate limiting.
4. The client build passes, but the bundle is large enough to trigger Vite’s chunk-size warning.

## Recommended Follow-Up

1. Implement real search behavior or temporarily hide the search affordance.
2. Decide whether `/prompts/create` should fetch prompt context from a URL parameter instead of navigation state.
3. Re-run a full browser auth persistence test with a valid non-rate-limited account.