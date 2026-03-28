/* =========================================
   0. PASSWORTSCHUTZ (Verschleiert)
   ========================================= */
const SECRET_ENCODED = "dGltbQ==";

if (sessionStorage.getItem("timm_auth") !== "true") {
  let userInput = prompt("Bitte Passwort eingeben, um Timms Rezepte zu sehen:");
  
  // Die Funktion btoa() übersetzt die Eingabe des Nutzers ebenfalls in die Geheimschrift
  // und vergleicht sie dann mit unserem geheimen Code.
  if (userInput !== null && btoa(userInput) === SECRET_ENCODED) {
    sessionStorage.setItem("timm_auth", "true");
  } else {
    document.body.innerHTML = `
      <div style="text-align:center; padding: 50px; font-family: 'Nunito', sans-serif; background: #fff; min-height: 100vh;">
        <h1 style="color: #c5221f;">🛑 Zugriff verweigert</h1>
        <p style="margin: 20px 0; color: #666;">Das Passwort war leider falsch oder die Eingabe wurde abgebrochen.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; font-size: 1rem; border-radius: 8px; border: none; background: #6b3fa0; color: white; cursor: pointer; font-weight: bold;">Nochmal versuchen</button>
      </div>
    `;
    throw new Error("Skriptausführung gestoppt - Falsches Passwort.");
  }
}

/* =========================================
   1. GLOBALE KONSTANTEN
   ========================================= */
const STORAGE_FAVORITES = "timm-favorites-v1";
const IGNORE_TAGS = ["Pfanne", "Pfanne/Ofen", "Ofen", "Familienküche", "Beilage", "Optional Fisch/Meeresfrüchte", "Mitteleuropäisch", "Asiatisch inspiriert"];

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
  
  // Wir wandeln beide Seiten für den reinen Vergleich in Text um (String), 
  // um den Typ-Fehler (Zahl vs. Text) für immer auszuschließen.
  const exists = favs.find(id => String(id) === String(recipeId));

  if (exists !== undefined) {
    // Wenn das Rezept schon drin ist: Rauswerfen!
    favs = favs.filter(id => String(id) !== String(recipeId));
    btnElement.classList.remove('active');
  } else {
    // Wenn nicht: Hinzufügen! 
    // Wir holen die exakte Original-ID aus der Datenbank, um den Typ sauber zu halten.
    const recipe = recipes.find(r => String(r.id) === String(recipeId));
    if (recipe) {
      favs.push(recipe.id);
    }
    btnElement.classList.add('active');
  }
  
  localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favs));
};

/* =========================================
   3. NATIVES TEILEN / KOPIEREN
   ========================================= */
window.shareRecipe = async function(recipeId, btnElement) {
  const r = recipes.find(x => x.id === recipeId);
  if (!r) return;

  const shareText = `🛒 Zutaten:\n${r.ingredients.map(i => '- ' + i).join('\n')}\n\n👨‍🍳 Zubereitung:\n${r.steps.map((s, idx) => (idx+1) + '. ' + s).join('\n')}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: r.title,
        text: shareText,
        url: window.location.href
      });
    } catch (err) {
      console.log('Fehler beim Teilen:', err);
    }
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = `${r.title}\n\n${shareText}`;
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
  }
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
  return "🍴";
}

function getColorClassForTag(tagText) {
  const t = tagText.toLowerCase();
  if (t.includes("vegetarisch") || t.includes("vegan") || t.includes("gemüse") || t.includes("salat") || t.includes("resteverwertung")) return "tag-green";
  if (t.includes("schnell") || t.includes("pasta") || t.includes("asiatisch") || t.includes("sattmacher") || t.includes("klassiker")) return "tag-yellow";
  if (t.includes("fleisch") || t.includes("mediterran") || t.includes("curry") || t.includes("herzhaft")) return "tag-red";
  if (t.includes("suppe") || t.includes("fisch") || t.includes("leicht") || t.includes("bowl")) return "tag-blue";
  return "tag-purple";
}

function renderTag(tagText) {
  return `<span class="tag ${getColorClassForTag(tagText)}">${getEmojiForTag(tagText)} ${tagText}</span>`;
}

/* =========================================
   5. SERVICE WORKER REGISTRIERUNG
   ========================================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(err => console.log("SW Fehler:", err));
  });
}

/* =========================================
   6. DARK MODE TOGGLE (MANUELL)
   ========================================= */
if (localStorage.getItem("timm_theme") === "dark") {
  document.body.classList.add("dark-mode");
}

window.toggleTheme = function() {
  document.body.classList.toggle("dark-mode");
  
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("timm_theme", "dark");
  } else {
    localStorage.setItem("timm_theme", "light");
  }
};
