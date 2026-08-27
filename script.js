/* ============================================================
   Contatore visite via JSONBin.io
   ============================================================
   COME FUNZIONA
   - Un unico bin JSONBin contiene un oggetto tipo:
       { "articolo-1": 12, "articolo-2": 4 }
   - Ogni chiave e' l'id della pagina (data-page-id nel <body>).
   - Al caricamento di una pagina con [data-page-id]:
       1. GET del bin
       2. se la chiave esiste -> +1
       3. se non esiste -> la crea con valore 1
       4. PUT del bin aggiornato
       5. mostra il numero nell'elemento #visit-count

   SICUREZZA
   - Qui uso la ACCESS KEY (scoped), NON la Master Key.
   - Nel dashboard JSONBin, questa Access Key va limitata a:
       - solo questo bin
       - solo permessi GET e PUT
     Mai mettere la Master Key in un file pubblico su GitHub Pages.
   ============================================================ */

const JSONBIN_CONFIG = {
  binId: "6a903125f5f4af5e294985e2", // <-- hack me. i dont care about it :)
  accessKey: "$2a$10$6XD5KNkhRlcGVkCkGKeB8OzYcL2oDsfqemjwFkO542JmOIvDaICYK", // Access Key scoped a giuseppepuleri.github.io
  baseUrl: "https://api.jsonbin.io/v3/b",
};

async function fetchBin() {
  const res = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}/latest`, {
    method: "GET",
    headers: {
      "X-Access-Key": JSONBIN_CONFIG.accessKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Errore lettura bin: ${res.status}`);
  }

  const data = await res.json();
  return data.record || {};
}

async function updateBin(updatedRecord) {
  const res = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": JSONBIN_CONFIG.accessKey,
    },
    body: JSON.stringify(updatedRecord),
  });

  if (!res.ok) {
    throw new Error(`Errore scrittura bin: ${res.status}`);
  }

  return res.json();
}

async function registerVisit(pageId) {
  const counterEl = document.getElementById("visit-count");

  try {
    const record = await fetchBin();

    if (Object.prototype.hasOwnProperty.call(record, pageId)) {
      record[pageId] = Number(record[pageId]) + 1;
    } else {
      record[pageId] = 1;
    }

    await updateBin(record);

    if (counterEl) {
      counterEl.textContent = record[pageId];
    }
  } catch (err) {
    console.error("Contatore visite non disponibile:", err);
    if (counterEl) {
      counterEl.textContent = "n/d";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const pageId = document.body.dataset.pageId;
  if (pageId) {
    registerVisit(pageId);
  }
});
