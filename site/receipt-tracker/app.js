
// OCR function: returns a Promise, provides progress and result
function runOCR(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            Tesseract.recognize(
                e.target.result,
                'eng+pol',
                { logger: m => { if (onProgress) onProgress(m); } }
            ).then(({ data: { text } }) => {
                const price = extractPrice(text);
                const date = extractDate(text);
                const kind = extractType(text);
                resolve({
                    ocr_text: text,
                    price,
                    date,
                    kind,
                    image: e.target.result
                });
            }).catch(reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// IndexedDB helpers
const DB_NAME = 'receiptsdb';
const DB_VERSION = 1;
const STORE_NAME = 'receipts';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveReceipt(data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.add(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Update an existing receipt by id
async function updateReceipt(data) {
    if (!data.id) throw new Error('Missing id for update');
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getAllReceipts() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// UI logic (to be integrated with Onsen UI)

// Add a cost record without an image
async function addCost({title, date, kind, price}) {
    if (!title || !date || !kind || !price) {
        throw new Error('Missing required fields');
    }
    const data = {
        title,
        date,
        kind,
        price: parseFloat(price),
        ocr_text: '',
        image: null
    };
    return await saveReceipt(data);
}
// Export all receipts as JSON
async function exportReceiptsAsJSON() {
    const receipts = await getAllReceipts();
    const json = JSON.stringify(receipts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export all images (as ZIP if JSZip is available, else as individual downloads)
async function exportImages() {
    const receipts = await getAllReceipts();
    if (window.JSZip) {
        const zip = new JSZip();
        receipts.forEach((r, i) => {
            if (r.image) {
                // Extract base64 data
                const base64 = r.image.split(',')[1];
                const ext = (r.image.match(/^data:image\/(\w+);/)||[])[1] || 'png';
                zip.file(`receipt_${i+1}.${ext}`, base64, {base64: true});
            }
        });
        zip.generateAsync({type: 'blob'}).then(function(content) {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'receipts_images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    } else {
        // Fallback: download images one by one
        receipts.forEach((r, i) => {
            if (r.image) {
                const a = document.createElement('a');
                a.href = r.image;
                a.download = `receipt_${i+1}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
        if (!receipts.length) {
            ons.notification.alert('No images to export.');
        }
    }
}
// - showReceiptsList()
// - showAddReceiptPopup()
// - updateStats()

function extractPrice(text) {
    // Match numbers with either ',' or '.' as decimal separator
    const priceRegex = /\b(\d{1,5}[\.,]\d{2})\b/g;
    let matches = [...text.matchAll(priceRegex)].map(m => {
        // Replace comma with dot, remove spaces
        return parseFloat(m[1].replace(',', '.').replace(/\s/g, ''));
    }).filter(v => !isNaN(v));
    if (matches.length) {
        // Return the largest value as the price (usually the total)
        return Math.max(...matches);
    }
    return null;
}

function extractDate(text) {
    const dateRegexes = [
        /(\d{4}[-\/.]\d{2}[-\/.]\d{2})/g,
        /(\d{2}[-\/.]\d{2}[-\/.]\d{4})/g
    ];
    for (const regex of dateRegexes) {
        const match = regex.exec(text);
        if (match) return match[1];
    }
    return null;
}

function extractType(text) {
    // English and Polish food/coffee keywords
    const food = /restaurant|food|grocery|cafe|pizza|bar|market|kanapka|kanapki|bagietka|zupa|pierogi|jajko|jajka|kurczak|kebab|frytki|ziemniak|ziemniaki|sernik|ciasto|ciastko|lody|jogurt|mleko|masło|chleb|bułka|bułki|szynka|ser|wędlina|sałatka|ryż|makaron|sok|napój|napoje|woda|mineralna|espresso|kawa|cappuccino|latte|herbata|czekolada|deser|śniadanie|obiad|kolacja|lunch|burger|hot-dog|hotdog|sandwich|tost|tosty|pączek|paczki|drożdżówka|drozdzowka|ciabatta|wrap|tortilla|pizza|kebab|bar mleczny|restauracja|sklep spożywczy|spożywczy|spożywcze|delikatesy|bistro|cukiernia|piekarnia|alkohol|piwo|wino|wódka|vodka|whisky|whiskey|rum|gin|likier|shot|drink|koktajl|koktajle|smoothie|shake|energy drink|napój energetyczny|napoje energetyczne/i;
    const transport = /bus|ticket|train|taxi|uber|tram|metro|bilet|kolej|autobus|tramwaj|pociąg|pociag|przejazd|przystanek|komunikacja miejska|mpk|ztm|pkp|lot|samolot|przelot|przewozy|flixbus|polskibus|blablacar/i;
    if (food.test(text)) return 'food';
    if (transport.test(text)) return 'transport';
    return 'other';
}
