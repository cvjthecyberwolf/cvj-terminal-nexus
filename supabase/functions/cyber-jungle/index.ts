import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, conversation, type = 'code' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle image generation
    if (type === 'image') {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { role: 'user', content: prompt }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error('AI Gateway error');
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        throw new Error('No image generated');
      }

      console.log('Generated image successfully');

      return new Response(
        JSON.stringify({ type: 'image', content: imageUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle code generation
    const messages = [
      {
        role: 'system',
        content: `You are Cyber Jungle, an AI-powered no-code development environment. Generate complete, working, self-contained React components.

CRITICAL RULES:
1. Generate COMPLETE, EXECUTABLE code that runs immediately
2. ALWAYS use CDN imports for any external libraries needed
3. Create a SINGLE self-contained component that works standalone
4. Use inline Tailwind CSS classes for styling
5. Include ALL necessary state management and logic
6. Add proper error handling and loading states
7. Make it responsive and beautiful
8. Component MUST be named "App" (export default function App())

REQUIRED FORMAT:
\`\`\`tsx
import React, { useState, useEffect } from 'react';

// If you need external libraries, import from CDN:
// Example: import axios from 'https://esm.sh/axios@1.6.0';
// Example: import { format } from 'https://esm.sh/date-fns@3.0.0';

export default function App() {
  // Your complete component code here
  // Include all state, effects, handlers, and UI
  
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Your beautiful, complete UI here */}
    </div>
  );
}
\`\`\`

EXAMPLES OF GOOD IMPORTS (if needed):
- Charts: import { LineChart, Line, XAxis, YAxis } from 'https://esm.sh/recharts@2.10.0';
- Icons: import { Heart, Star } from 'https://esm.sh/lucide-react@0.400.0';
- Date handling: import { format } from 'https://esm.sh/date-fns@3.0.0';
- HTTP: import axios from 'https://esm.sh/axios@1.6.0';

IMPORTANT:
- NO placeholder comments like "// Add more features"
- NO incomplete functions
- NO mock data unless it's part of the demo
- Everything must WORK and be BEAUTIFUL
- Test that syntax is valid before responding`
      },
      ...(conversation || []),
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway error');
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    console.log('Generated code successfully');

    return new Response(
      JSON.stringify({ type: 'code', content: generatedCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cyber-jungle function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
