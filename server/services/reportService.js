const supabase = require('../supabaseClient');

const VALID_REASONS = [
  'harassment',
  'hate_speech',
  'personal_information',
  'spam',
  'misinformation',
  'other',
];
  
const validateReportInput = ({ reason, description }) => {
  if (!reason || !VALID_REASONS.includes(reason)) {
    return 'Missing or invalid reason value.';
  }
  
  if (description && description.length > 1000) {
    return 'Description exceeds 1000 characters.';
  }
  
  return null;
};
  
const createReport = async ({
  reporterUserId,
  postId,
  replyId,
  reason,
  description,
}) => {
  if ((postId && replyId) || (!postId && !replyId)) {
    throw new Error('Report must target exactly one post or one reply.');
  }
  
  const targetTable = postId ? 'posts' : 'replies';
  const targetId = postId || replyId;
  
  // check that the reported post/reply exists
  const { data: target, error: targetError } = await supabase
    .from(targetTable)
    .select('id')
    .eq('id', targetId)
    .single();
  
  if (targetError || !target) {
    const error = new Error(`${postId ? 'Post' : 'Reply'} not found.`);
    error.statusCode = 404;
    throw error;
  }
  
  // insert report
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_user_id: reporterUserId,
      post_id: postId,
      reply_id: replyId,
      reason,
      description: description || null,
      status: 'pending',
    })
    .select('id')
    .single();
  
  if (error) {
    throw error;
  }
  
  // flag reported post/reply
  const { error: flagError } = await supabase
    .from(targetTable)
    .update({ is_flagged: true })
    .eq('id', targetId);
  
  if (flagError) {
    console.error(`Failed to flag ${targetTable}:`, flagError);
  }
  
  return {
    reportId: data.id,
  };
};

module.exports = {
  validateReportInput,
  createReport,
};
