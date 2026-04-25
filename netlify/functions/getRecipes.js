// netlify/functions/getRecipes.js

exports.handler = async function(event, context) {
  console.log("🚀 Funktion getRecipes gestartet!"); 

  // KORREKTUR: Nur die Basis-URL eintragen, ohne Pfad am Ende!
  const allowedOrigin = "https://orkspalter.netlify.app"; 

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
      throw new Error("Supabase Keys fehlen im Tresor!");
    }

    console.log("📡 Hole Rezepte aus Supabase...");
    
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
      throw new Error(`Supabase Datenbank-Fehler: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Erfolgreich ${data.length} Rezepte geladen!`);

    // Die Liste der Rezepte erfolgreich ans Frontend schicken
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("💥 FEHLER ABGEFANGEN:", error.message);
    return { 
      statusCode: 500, 
      headers: headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};