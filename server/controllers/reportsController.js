const supabase = require('../supabaseClient');

const {
    validateReportInput,
    createReport,
} = require('../services/reportService');

const reportPost = async (req, res) => {
  try {
    // validate input
    const error = validateReportInput(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
  
    // auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No auth token' });
    }
  
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }
  
    // get user from Supabase
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  
    const reporterUserId = data.user.id;
  
    // create report
    const result = await createReport({
      reporterUserId,
      postId: req.params.id,
      replyId: null,
      reason: req.body.reason,
      description: req.body.description,
    });
  
    return res.status(201).json({
      message: 'Report submitted successfully.',
      report_id: result.reportId,
    });
  
  } catch (error) {
    console.error('Error reporting post:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error.' });
  }
};


const reportReply = async (req, res) => {
  try {
    const error = validateReportInput(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
  
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No auth token' });
    }
  
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }
  
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  
    const reporterUserId = data.user.id;
  
    const result = await createReport({
      reporterUserId,
      postId: null,
      replyId: req.params.id,
      reason: req.body.reason,
      description: req.body.description,
    });
  
    return res.status(201).json({
      message: 'Report submitted successfully.',
      report_id: result.reportId,
    });
  
  } catch (error) {
    console.error('Error reporting reply:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  reportPost,
  reportReply,
};