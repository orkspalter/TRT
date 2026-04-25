// netlify/functions/saveRecipe.js

exports.handler = async function(event, context) {
  console.log("🚀 Funktion saveRecipe gestartet!"); 

  // KORREKTUR: Nur die Basis-URL (ohne /generator.html am Ende!)
  const allowedOrigin = "https://orkspalter.netlify.app"; 

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
    console.log("📥 Empfangene Daten:", event.body);
    const recipe = JSON.parse(event.body);
    
    // Die Tresor-Schlüssel abrufen
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log("🔑 Supabase URL da?", !!supabaseUrl);
    console.log("🔑 Supabase Key da?", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase Keys fehlen im Tresor! (Bitte Netlify neu deployen)");
    }

    console.log("📡 Sende an Supabase...");
    const response = await fetch(`${supabaseUrl}/rest/v1/saved_recipes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps
      })
    });

    console.log("📨 Supabase Antwort-Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase Fehler: ${errorText}`);
    }

    console.log("✅ Erfolgreich gespeichert!");
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ success: true })
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