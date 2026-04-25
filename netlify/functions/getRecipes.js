// netlify/functions/getRecipes.js

exports.handler = async function(event, context) {
  // WICHTIG: Hier wieder deine echte Netlify-Adresse eintragen!
  const allowedOrigin = "https://orkspalter.netlify.app/"; 

  const headers = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: headers, body: "OK" };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "Supabase Keys fehlen!" }) };
    }

    // Wir rufen alle Rezepte aus der Tabelle 'saved_recipes' ab
    const response = await fetch(`${supabaseUrl}/rest/v1/saved_recipes?select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase Fehler: ${errorText}`);
    }

    const data = await response.json();

    // Die Liste der Rezepte erfolgreich ans Frontend schicken
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      headers: headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};