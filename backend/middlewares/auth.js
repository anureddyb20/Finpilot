const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('YOUR_'))
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: SUPABASE_URL or keys are not set in backend/.env.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Authentication required' } });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify Supabase token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }

    // Attach user to request
    req.user = { userId: user.id };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: { message: 'Authentication failed' } });
  }
};

module.exports = { requireAuth };
