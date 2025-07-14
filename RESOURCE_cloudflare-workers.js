// This is your Cloudflare Worker script
// It acts as a secure bridge between your website and OpenAI's API

export default {
  // This function runs when someone makes a request to your worker
  async fetch(request, env, ctx) {
    
    // Handle CORS (Cross-Origin Resource Sharing) - this allows your website to talk to the worker
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests (this is how we send data to OpenAI)
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the data sent from your website
      const requestData = await request.json();
      
      // Make a request to OpenAI's API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          // Use your OpenAI API key (stored securely in Cloudflare)
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Send the data to OpenAI
        body: JSON.stringify(requestData),
      });

      // Get OpenAI's response
      const openaiData = await openaiResponse.json();
      
      // Send the response back to your website
      return new Response(JSON.stringify(openaiData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
      
    } catch (error) {
      // If something goes wrong, send an error message
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Something went wrong. Please try again.' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};