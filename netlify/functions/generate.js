// Das ist dein sicherer Mini-Server! Er läuft nur im Hintergrund bei Netlify.

exports.handler = async function(event, context) {
  // Wir erlauben nur POST-Anfragen (wenn jemand etwas abschicken will)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Nur POST erlaubt" };
  }

  try {
    // 1. Zutaten aus der Anfrage der Website auslesen
    const body = JSON.parse(event.body);
    const inputVal = body.inputVal;
    
    // 2. Den geheimen Schlüssel aus dem Tresor von Netlify holen
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API-Key fehlt im Tresor!" }) };
    }

    // 3. Den Prompt bauen
    const prompt = `
      Du bist Timm, ein kreativer Koch. Der Nutzer sagt dir, welche Zutaten er hat: "${inputVal}".
      Erstelle daraus ein leckeres, alltagstaugliches Rezept.
      Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt.
      Das JSON muss exakt diese Struktur haben:
      {
        "title": "Kreativer Rezeptname OHNE Emojis und OHNE Symbole",
        "ingredients": ["Zutat 1 mit Menge", "Zutat 2 mit Menge"],
        "steps": ["Schritt 1", "Schritt 2", "Schritt 3"]
      }
    `;

    // 4. Gemini anfunken
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: `Google API Fehler: ${errorText}` }) };
    }

    const data = await response.json();
    let jsonText = data.candidates[0].content.parts[0].text;
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    // 5. Das fertige JSON an deine Website zurückschicken
    return {
      statusCode: 200,
      body: jsonText 
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};