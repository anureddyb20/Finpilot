const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('YOUR_'))
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Starting programmatic integration test...");
  
  const email = `test_${Date.now()}@example.com`;
  const password = "Password123!";
  
  console.log(`1. Signing up test user: ${email}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Test User",
        country: "India"
      }
    }
  });
  
  if (signUpError) {
    console.error("Sign up failed:", signUpError);
    return;
  }
  
  const userId = signUpData.user.id;
  const session = signUpData.session;
  let accessToken = session?.access_token;
  
  console.log(`User created with ID: ${userId}`);
  
  if (!accessToken) {
    console.log("Email confirmation might be enabled. Attempting login...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (signInError) {
      console.error("Sign in failed:", signInError);
      return;
    }
    accessToken = signInData.session.access_token;
  }
  
  console.log("2. Inserting mock financial data...");
  
  // Insert transactions
  const { error: txErr } = await supabase.from('transactions').insert([
    {
      user_id: userId,
      type: 'income',
      category: 'Salary',
      amount: 75000,
      date: new Date().toISOString().split('T')[0],
      time: '10:00:00',
      merchant: 'Tech Corp',
      method: 'Bank Transfer'
    },
    {
      user_id: userId,
      type: 'expense',
      category: 'Food & Dining',
      amount: 8500,
      date: new Date().toISOString().split('T')[0],
      time: '13:00:00',
      merchant: 'Supermarket',
      method: 'Debit Card'
    },
    {
      user_id: userId,
      type: 'expense',
      category: 'Shopping',
      amount: 7500,
      date: new Date().toISOString().split('T')[0],
      time: '16:00:00',
      merchant: 'Amazon',
      method: 'Credit Card'
    }
  ]);
  
  if (txErr) {
    console.error("Error inserting transactions:", txErr);
  }

  // Insert budgets
  const now = new Date();
  const { error: bgErr } = await supabase.from('budgets').insert([
    {
      user_id: userId,
      category: 'Food & Dining',
      limit_amount: 10000,
      spent_amount: 8500,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    },
    {
      user_id: userId,
      category: 'Shopping',
      limit_amount: 8000,
      spent_amount: 7500,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }
  ]);
  
  if (bgErr) {
    console.error("Error inserting budgets:", bgErr);
  }

  // Insert goals
  const { error: glErr } = await supabase.from('goals').insert([
    {
      user_id: userId,
      name: 'Laptop',
      target_amount: 100000,
      saved_amount: 45000,
      status: 'In Progress',
      target_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0]
    }
  ]);
  
  if (glErr) {
    console.error("Error inserting goals:", glErr);
  }

  // Insert recurring payments
  const { error: rpErr } = await supabase.from('recurring_payments').insert([
    {
      user_id: userId,
      name: 'Netflix',
      amount: 649,
      due_date: 15,
      category: 'Subscription',
      frequency: 'Monthly',
      status: 'Active'
    },
    {
      user_id: userId,
      name: 'Spotify',
      amount: 119,
      due_date: 18,
      category: 'Subscription',
      frequency: 'Monthly',
      status: 'Active'
    }
  ]);
  
  if (rpErr) {
    console.error("Error inserting recurring payments:", rpErr);
  }

  console.log("3. Calling FinPilot AI Advisor chat API...");
  try {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        message: "How can I improve my savings?"
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }
    
    console.log("\n=================== AI RESPONSE ===================");
    console.log(data.response);
    console.log("===================================================\n");
  } catch (chatError) {
    console.error("Chat API call failed:", chatError.message);
  }

  console.log("4. Cleaning up test data...");
  // Clean up
  await Promise.all([
    supabase.from('transactions').delete().eq('user_id', userId),
    supabase.from('budgets').delete().eq('user_id', userId),
    supabase.from('goals').delete().eq('user_id', userId),
    supabase.from('recurring_payments').delete().eq('user_id', userId),
    supabase.from('profiles').delete().eq('id', userId)
  ]);
  
  console.log("Test completed and cleaned up successfully!");
}

runTest();
