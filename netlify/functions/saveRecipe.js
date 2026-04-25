// netlify/functions/saveRecipe.js

exports.handler = async function(event, context) {
  // 1. WICHTIG: Hier wieder deine ECHTE Netlify-URL eintragen!
  const allowedOrigin = "https://orkspalter.netlify.app/"; 

  const headers = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Preflight für den Browser beantworten
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: headers, body: "OK" };
  }

  // Nur POST-Anfragen zulassen
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: headers, body: "Method Not Allowed" };
  }

  try {
    // Das Rezept, das der Browser uns schickt
    const recipe = JSON.parse(event.body);
    
    // Die Tresor-Schlüssel abrufen
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "Supabase Keys fehlen im Tresor!" }) };
    }

    // Die Daten an Supabase senden
    const response = await fetch(`${supabaseUrl}/rest/v1/saved_recipes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal' // Sagt Supabase: "Wir brauchen keine Antwort, nur ein OK"
      },
      body: JSON.stringify({
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase Fehler: ${errorText}`);
    }

    // Alles hat geklappt!
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      headers: headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};