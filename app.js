/* =========================================
   0. PASSWORTSCHUTZ (Einfach)
   ========================================= */
const SECRET_PASSWORD = "EINSTEIN"; // <-- HIER dein Wunschpasswort eintragen!

// Prüfen, ob das Passwort in diesem Tab schon eingegeben wurde
if (sessionStorage.getItem("timm_auth") !== "true") {
  let userInput = prompt("Bitte Passwort eingeben, um Timms Rezepte zu sehen:");
  
  if (userInput === SECRET_PASSWORD) {
    // Richtiges Passwort: Für diese Sitzung merken
    sessionStorage.setItem("timm_auth", "true");
  } else {
    // Falsches Passwort: Seite komplett leeren und Warnung anzeigen
    document.body.innerHTML = `
      <div style="text-align:center; padding: 50px; font-family: 'Nunito', sans-serif;">
        <h1 style="color: #c5221f;">🛑 Zugriff verweigert</h1>
        <p style="margin: 20px 0; color: #666;">Das Passwort war leider falsch oder die Eingabe wurde abgebrochen.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; font-size: 1rem; border-radius: 8px; border: none; background: #6b3fa0; color: white; cursor: pointer; font-weight: bold;">Nochmal versuchen</button>
      </div>
    `;
    throw new Error("Falsches Passwort - Skriptausführung gestoppt."); // Stoppt den Rest der App
  }
}

/* =========================================
   1. GLOBALE KONSTANTEN
   ========================================= */
const STORAGE_FAVORITES = "timm-favorites-v1";

// Tags, die auf den Karten nicht angezeigt oder mitgefiltert werden sollen
const IGNORE_TAGS = [
  "Pfanne", "Pfanne/Ofen", "Ofen", "Familienküche", 
  "Beilage", "Optional Fisch/Meeresfrüchte", 
  "Mitteleuropäisch", "Asiatisch inspiriert"
];


/* =========================================
   2. FAVORITEN-SYSTEM (HERZ)
   ========================================= */
function getFavorites() {
  const raw = localStorage.getItem(STORAGE_FAVORITES);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

window.toggleFavorite = function(recipeId, btnElement) {
  let favs = getFavorites();
  
  if (favs.includes(recipeId)) {
    // Wenn schon Favorit: Entfernen
    favs = favs.filter(id => id !== recipeId);
    btnElement.classList.remove('active');
  } else {
    // Wenn noch kein Favorit: Hinzufügen
    favs.push(recipeId);
    btnElement.classList.add('active');
  }
  
  // Im Browser speichern
  localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favs));
};


/* =========================================
   3. REZEPT KOPIEREN
   ========================================= */
window.copyRecipe = function(recipeId, btnElement) {
  const r = recipes.find(x => x.id === recipeId);
  if (!r) return;

  const textToCopy = `${r.title}\n\n🛒 Zutaten:\n${r.ingredients.map(i => '- ' + i).join('\n')}\n\n👨‍🍳 Zubereitung:\n${r.steps.map((s, idx) => (idx+1) + '. ' + s).join('\n')}`;

  const textArea = document.createElement("textarea");
  textArea.value = textToCopy;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  
  textArea.select();
  
  try {
    document.execCommand('copy');
    const originalHTML = btnElement.innerHTML;
    btnElement.innerHTML = "✅ Kopiert!";
    setTimeout(() => {
      btnElement.innerHTML = originalHTML;
    }, 2000);
  } catch (err) {
    console.error('Kopieren fehlgeschlagen', err);
  }
  
  document.body.removeChild(textArea);
};


/* =========================================
   4. TAGS, EMOJIS & FARBEN
   ========================================= */
function getEmojiForTag(tagText) {
  const t = tagText.toLowerCase();
  
  if (t.includes("vegetarisch") || t.includes("vegan") || t.includes("gemüse")) return "🌱";
  if (t.includes("schnell") || t.includes("einfach")) return "⏱️";
  if (t.includes("pasta") || t.includes("nudel")) return "🍝";
  if (t.includes("suppe") || t.includes("eintopf")) return "🍲";
  if (t.includes("fleisch") || t.includes("hähnchen") || t.includes("rind")) return "🥩";
  if (t.includes("fisch") || t.includes("lachs")) return "🐟";
  if (t.includes("asiatisch")) return "🍜";
  if (t.includes("deutsch")) return "🇩🇪";
  if (t.includes("leicht")) return "🪽";
  if (t.includes("mediterran")) return "💃";
  if (t.includes("salat")) return "🥬";
  if (t.includes("sattmacher")) return "🫃";
  if (t.includes("klassiker")) return "👵"; 
  if (t.includes("curry")) return "🔥";
  if (t.includes("bowl")) return "🥣";
  if (t.includes("herzhaft")) return "🧂";
  if (t.includes("resteverwertung")) return "♻️";
  
  return "🍴"; // Standard-Emoji
}

function getColorClassForTag(tagText) {
  const t = tagText.toLowerCase();
  
  // GRÜN (Gesund, Gemüse, Nachhaltig)
  if (t.includes("vegetarisch") || t.includes("vegan") || t.includes("gemüse") || t.includes("salat") || t.includes("resteverwertung")) return "tag-green";
  // GELB (Nudeln, Sattmacher, Tradition)
  if (t.includes("schnell") || t.includes("pasta") || t.includes("asiatisch") || t.includes("sattmacher") || t.includes("klassiker")) return "tag-yellow";
  // ROT (Würzig, Deftig, Heiß)
  if (t.includes("fleisch") || t.includes("mediterran") || t.includes("curry") || t.includes("herzhaft")) return "tag-red";
  // BLAU (Leichtes, Flüssiges, Maritimes)
  if (t.includes("suppe") || t.includes("fisch") || t.includes("leicht") || t.includes("bowl")) return "tag-blue";
  
  // VIOLETT (Standard)
  return "tag-purple";
}

function renderTag(tagText) {
  return `<span class="tag ${getColorClassForTag(tagText)}">${getEmojiForTag(tagText)} ${tagText}</span>`;
}


/* =========================================
   5. SERVICE WORKER REGISTRIERUNG
   ========================================= */
// Sorgt dafür, dass die App offline funktioniert
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(err => console.log("SW Fehler:", err));
  });
}