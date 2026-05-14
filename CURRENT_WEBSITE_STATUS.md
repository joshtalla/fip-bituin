# Current Website Status

Date: 2026-05-13

## Scope

This document records the current state of the website after implementing the recent backend and frontend wiring fixes, validating the edited files locally, and checking the live app architecture against the current Supabase schema.

## Environment Verified

- Server expected at `http://localhost:3000`
- Client expected at `http://localhost:5173`
- File-level validation and targeted ESLint checks pass for the recently edited frontend and backend surfaces
- Supabase schema now includes post and reply media columns and a public `post-media` storage bucket

## Executive Summary

The main prompt-board and post-detail flows are now wired, and the content model is materially closer to the intended product behavior.

- The prompt board now fetches today’s prompt from the backend.
- The star grid now has a live backend endpoint for prompt-specific posts.
- Post detail pages are implemented and backed by a real API route.
- Protected routing is active for prompt, search, create-post, and post-detail pages.
- Signup now carries location and language into the user-profile creation flow.
- `/profile` and `/explore` have been hidden from the shipped navigation and now redirect away instead of exposing placeholders.
- Post creation now self-heals missing user-profile rows instead of failing immediately when a `users` row is absent.
- Post creation now derives `category` from the selected prompt and `language` from the `users` table.
- Anonymous fallback names no longer derive from email and now use a Filipino-American themed generator.
- The create-post page now uses the shared navbar component instead of a dead frontend-only mock navbar.
- Posts and replies now support optional media attachments backed by Supabase Storage.
- Media now renders on post detail pages, reply threads, and star-hover previews when the preview is small enough to show it cleanly.

The main remaining product gap is search. It is still UI-only and does not query the backend.

## Verified Backend Status

### Working endpoints

- `GET /api/health` returns a healthy response.
- `GET /api/prompts/today` returns a real prompt from the backend.
- `GET /api/prompts/archive` returns archived prompts from the backend.
- `GET /api/prompts/:promptId/posts` returns live posts for a prompt.
- `GET /api/posts/:id` returns a single live post.
- `GET /api/posts/:postId/replies` returns live replies for a post.
- `POST /api/posts` rejects unauthenticated requests with `401` and now accepts text, media, or both for authenticated users.
- `POST /api/posts/:postId/replies` and `POST /api/replies/:replyId/replies` now accept text, media, or both for authenticated users.

### Backend fixes applied

- The posts service now reads the `users` table using `auth_user_id` rather than assuming the auth UUID is stored in `users.id`.
- Post creation now maps `users.username` into `posts.anonymous_name` and stores the correct `users.id` in `posts.user_id`.
- Post creation now backfills a missing profile row or missing username when the authenticated user exists in Supabase Auth but not yet in `users`.
- Post creation now copies the prompt `category` into the inserted post row.
- Post creation now copies `language` from the resolved user profile into the inserted post row.
- Post and reply services now validate and persist `media_url`, `media_type`, `media_width`, and `media_height`.
- Post and reply read queries now expose media fields to the client.

## Auth Status

### What is implemented

- The app initializes auth state through Supabase session lookup on load.
- The app subscribes to auth state changes.
- The auth context now looks up profiles using `users.auth_user_id`.
- If a logged-in user has no matching profile row yet, the client attempts to create it from auth metadata.
- If a profile query returns no row or a row with a missing username, the client now repairs that state instead of silently carrying an incomplete profile.
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
- The page now uses the shared navbar component rather than a disconnected mock navbar.
- Publish uses the active Supabase session token and posts to `POST /api/posts`.
- The compose surface now supports optional media upload to the `post-media` Supabase bucket.
- Publishing now allows text-only, media-only, or mixed text-plus-media posts.
- The page now disables publishing when no prompt id is present.
- Direct entry is still allowed, but it shows a warning because it depends on prompt context from the board.

### `/prompts/:postId`

Status: Implemented and backend-connected

- The route now loads a real post via `GET /api/posts/:id`.
- It also loads live replies via `GET /api/posts/:postId/replies`.
- Reply composition now supports optional media upload to the `post-media` bucket.
- Post and reply attachments render in the detail view.
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

## Media Support Status

### Storage and schema

- `posts` now supports `media_url`, `media_type`, `media_width`, and `media_height`.
- `replies` now supports `media_url`, `media_type`, `media_width`, and `media_height`.
- Supabase Storage now includes a public `post-media` bucket for attachments.

### Client behavior

- The create-post flow validates JPG, PNG, WEBP, and GIF uploads before sending them to Supabase Storage.
- The reply composer uses the same validation and upload path as the post composer.
- Post detail renders attached media inline below the post body.
- Reply cards and nested reply cards render attached media inline.
- Star-hover previews render media when the preview can accommodate it without overwhelming the card.

### Validation note

- Static validation for the upload and render paths passed.
- A full end-to-end live upload verification from the terminal was not completed because the shell session was not configured to exercise the authenticated browser flow directly.

## Data Wiring Summary

### Properly wired today

- Client login to Supabase auth
- Client signup to Supabase auth
- Client profile creation fallback to the `users` table
- Client profile repair when a row is missing or missing a username
- Server prompt retrieval from Supabase
- Server prompt-post retrieval from Supabase
- Server post-detail retrieval from Supabase
- Server reply retrieval from Supabase
- Client prompt board to live prompt endpoint
- Client star grid to live post endpoint
- Client post detail page to live post endpoint
- Client post creation request to Express backend
- Client reply creation request to Express backend
- Backend auth validation for post creation
- Backend auth validation for reply creation
- Post category propagation from `prompts.category`
- Post language propagation from `users.language`
- Post and reply media upload to Supabase Storage plus metadata persistence to Supabase tables
- Protected routing on authenticated app pages

### Still incomplete today

- Search does not query any backend or Supabase data source
- `/prompts/create` still relies on prompt context from the board for the best experience
- End-to-end browser validation of a fresh signup/login flow was limited by Supabase signup throttling during testing
- Attachment rendering has been wired, but broader UX polish for large media galleries or multiple attachments does not exist because the schema currently supports a single asset per post or reply

## Current Risks

1. Search still looks available in the UI but is not actually wired.
2. The create-post page still has a weaker direct-entry experience when opened without prompt context.
3. Auth persistence is implemented and now used, but a full successful new-user browser validation was blocked by Supabase rate limiting.
4. Live media upload behavior should still be exercised in the authenticated browser flow against the configured Supabase project.
5. The client build previously passed, but bundle size should still be monitored as media-related UI grows.

## Recommended Follow-Up

1. Implement real search behavior or temporarily hide the search affordance.
2. Decide whether `/prompts/create` should fetch prompt context from a URL parameter instead of navigation state.
3. Re-run a full browser auth persistence test with a valid non-rate-limited account.
4. Run a manual browser pass for text-only, media-only, and mixed post and reply creation.
5. Decide whether post/reply cards should expose attachment dimensions, captions, or richer preview states in future iterations.