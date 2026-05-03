/**
 * -----------------------------------------------------------------------------
 * Replies Controller
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Handles HTTP request/response flow for replies endpoints.
 *
 * How this file connects to others:
 *   - Called by routes/replies.js
 *   - Uses services/replyService.js for database/business operations
 *   - Uses supabase.auth.getUser(token) to resolve authenticated users
 *
 * Responsibilities:
 *   - Parse and validate request inputs (params, query, body)
 *   - Enforce API-level error responses and status codes
 *   - Delegate persistence/business logic to the service layer
 * -----------------------------------------------------------------------------
 */

const supabase = require('../supabaseClient');
const replyService = require('../services/replyService');

/**
 * Validate UUID format for route params.
 *
 * @param {string} uuid
 * @returns {boolean}
 */
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * POST /api/posts/:postId/replies
 *
 * Creates a top-level reply for a given post.
 *
 * Flow:
 *   1) Validate route params and content
 *   2) Resolve authenticated user from Bearer token
 *   3) Load user profile (anonymous_name + language)
 *   4) Confirm post exists
 *   5) Delegate insert to service layer
 *
 * Returns:
 *   201 with public reply shape on success
 *   400/401/404 for expected validation/auth/not-found failures
 *   500 for unexpected server errors
 */
exports.createTopLevelReply = async (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body || {};

    // 400: Invalid route param
    if (!isValidUUID(postId)) {
        return res.status(400).json({ message: 'Invalid field: postId (must be UUID)' });
    }
    // 400: Invalid or missing content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid field: content (required and cannot be empty)' });
    }
    // 400: Length validation
    if (content.length > 1000) {
        return res.status(400).json({ message: 'Invalid field: content (must be under 1000 characters)' });
    }

    try {
        // 401: Auth resolution from Bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthenticated: No auth token" });
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthenticated: Invalid authorization format" });
        }
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ message: "Unauthenticated: Invalid token" });
        }

        const auth_user_id = data.user.id;

        // Resolve reply identity defaults from users table
        const userProfile = await replyService.getUserProfile(auth_user_id);

        const user = {
            id: auth_user_id,
            anonymous_name: userProfile.anonymous_name,
            language: userProfile.language
        };

        const postExists = await replyService.checkPostExists(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Delegate persistence/business logic to service
        const reply = await replyService.createTopLevelReply(postId, user, content);

        // Respond with the created reply
        res.status(201).json(reply);
    } catch (err) {
        console.error('Error creating reply:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/replies/:replyId/replies
 *
 * Creates a nested reply under an existing top-level reply.
 * Enforces one-level-only nesting.
 *
 * Flow:
 *   1) Validate route params and content
 *   2) Resolve authenticated user from Bearer token
 *   3) Load user profile (anonymous_name + language)
 *   4) Fetch parent reply and validate nesting depth
 *   5) Delegate insert to service layer
 *
 * Returns:
 *   201 on success
 *   400 if parent reply is already nested
 *   401/404 for auth/not-found failures
 *   500 for unexpected errors
 */
exports.createNestedReply = async (req, res) => {
    const replyId = req.params.replyId;
    const { content } = req.body || {};

    // 400: Invalid route param
    if (!isValidUUID(replyId)) {
        return res.status(400).json({ message: 'Invalid field: replyId (must be UUID)' });
    }
    // 400: Invalid or missing content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid field: content (required and cannot be empty)' });
    }
    if (content.length > 1000) {
        return res.status(400).json({ message: 'Invalid field: content (must be under 1000 characters)' });
    }

    try {
        // 401: Auth resolution from Bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthenticated: No auth token" });
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthenticated: Invalid authorization format" });
        }
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ message: "Unauthenticated: Invalid token" });
        }

        const auth_user_id = data.user.id;

        // Resolve reply identity defaults from users table
        const userProfile = await replyService.getUserProfile(auth_user_id);

        const user = {
            id: auth_user_id,
            anonymous_name: userProfile.anonymous_name,
            language: userProfile.language
        };

        // Validate parent reply existence/depth
        const parentReply = await replyService.getReplyById(replyId);
        if (!parentReply) {
            return res.status(404).json({ message: 'Parent reply not found.' });
        }
        // 400: Enforce one-level nesting
        if (parentReply.parent_reply_id !== null) {
            return res.status(400).json({ message: 'Nesting depth exceeded: Replies can only be nested one level deep.' });
        }

        // Delegate persistence/business logic to service
        const reply = await replyService.createNestedReply(parentReply, user, content);

        res.status(201).json(reply);
    } catch (err) {
        console.error('Error creating nested reply:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/posts/:postId/replies
 *
 * Fetches replies for a post as a flat, paginated list.
 * Frontend is responsible for nesting using parent_reply_id.
 *
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 20)
 *
 * Returns:
 *   200 with { replies, total, page, limit }
 *   400/404/500 for invalid input, not found, or server failures
 */
exports.getRepliesForPost = async (req, res) => {
    const postId = req.params.postId;
    if (!isValidUUID(postId)) {
        return res.status(400).json({ message: 'Invalid postId format (must be UUID)' });
    }

    // Parse pagination params with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    try {
        const postExists = await replyService.checkPostExists(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const { replies, total } = await replyService.getRepliesForPost(postId, page, limit);
        res.status(200).json({
            replies,
            total,
            page,
            limit
        });
    } catch (err) {
        console.error('Error fetching replies:', err);
        res.status(500).json({ message: 'Error(500):Internal server error' });
    }
};
