let quotes = [];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" }
    ];
    saveQuotes();
  }
}

// --- NEW: Filter Quotes Function ---
function filterQuotes() {
  const selected = categoryFilter.value;
  saveSelectedCategory(selected);

  const filteredQuotes = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  // Show a random quote from the filtered list
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}


// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected filter to localStorage
function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

// Load selected filter from localStorage
function loadSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

// Populate dropdown from quote categories
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const savedCategory = loadSelectedCategory();

  categoryFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore saved selection
  categoryFilter.value = savedCategory;
}

// Display a random quote based on filter
function showRandomQuote() {
  const selected = categoryFilter.value;
  saveSelectedCategory(selected);

  const filteredQuotes = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add a new quote and update category options
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Generate the quote form
function createAddQuoteForm() {
  const form = document.getElementById("quoteForm");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.id = "newQuoteCategory";
  inputCat.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.type = "button";
  addBtn.onclick = addQuote;

  form.appendChild(inputText);
  form.appendChild(inputCat);
  form.appendChild(addBtn);
}

// Export quotes to a downloadable JSON file
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Load last viewed quote (sessionStorage)
function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }
}
// Simulated server quotes (as if fetched from remote)
const mockServerQuotes = [
  { id: 1, text: "Be the change you wish to see in the world.", category: "Motivation" },
  { id: 2, text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
  { id: 3, text: "Success usually comes to those who are too busy to be looking for it.", category: "Success" }
];

// Merge server quotes with local, preferring server values for same IDs
function syncWithServer() {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const localById = Object.fromEntries(localQuotes.map(q => [q.id || q.text, q]));
  const serverById = Object.fromEntries(mockServerQuotes.map(q => [q.id || q.text, q]));

  const merged = [];

  // Merge server and local - server wins if there's a conflict
  for (const key in serverById) {
    merged.push(serverById[key]);
    if (localById[key] && JSON.stringify(serverById[key]) !== JSON.stringify(localById[key])) {
      notifyConflict(serverById[key], localById[key]);
    }
  }

  // Add any local-only quotes
  for (const key in localById) {
    if (!serverById[key]) {
      merged.push(localById[key]);
    }
  }

  localStorage.setItem("quotes", JSON.stringify(merged));
  quotes = merged;
  populateCategories();
  showSyncStatus("Quotes synced from server");
}

// Simulate periodic polling (every 15 seconds)
setInterval(syncWithServer, 15000);

function notifyConflict(serverQuote, localQuote) {
  const msg = `Conflict resolved: Server version for "${serverQuote.text}" overwritten local copy.`;
  console.warn(msg);
  showSyncStatus(msg);
}


function showSyncStatus(message) {
  const statusEl = document.getElementById("syncStatus");
  statusEl.textContent = `${message} (Last sync: ${new Date().toLocaleTimeString()})`;
}

// Simulated fetch from a server (mocked)
function fetchQuotesFromServer() {
  return new Promise((resolve) => {
    const mockServerQuotes = [
      { id: 1, text: "Be the change you wish to see in the world.", category: "Motivation" },
      { id: 2, text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
      { id: 3, text: "Success usually comes to those who are too busy to be looking for it.", category: "Success" }
    ];

    // Simulate network delay
    setTimeout(() => {
      resolve(mockServerQuotes);
    }, 1000);
  });
}


function syncWithServer() {
  fetchQuotesFromServer().then(serverQuotes => {
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const localById = Object.fromEntries(localQuotes.map(q => [q.id || q.text, q]));
    const serverById = Object.fromEntries(serverQuotes.map(q => [q.id || q.text, q]));

    const merged = [];

    // Server data takes precedence
    for (const key in serverById) {
      merged.push(serverById[key]);
      if (localById[key] && JSON.stringify(serverById[key]) !== JSON.stringify(localById[key])) {
        notifyConflict(serverById[key], localById[key]);
      }
    }

    // Add any local-only quotes
    for (const key in localById) {
      if (!serverById[key]) {
        merged.push(localById[key]);
      }
    }

    localStorage.setItem("quotes", JSON.stringify(merged));
    quotes = merged;
    populateCategories();
    showSyncStatus("Quotes synced from server");
  }).catch(error => {
    console.error("Sync failed:", error);
    showSyncStatus("Failed to sync with server.");
  });
}


setInterval(syncWithServer, 15000); // every 15 seconds

async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const data = await response.json();

  // Convert posts to quote format
  return data.map(post => ({
    id: post.id,
    text: post.title,
    category: "Server"
  }));
}

async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const localById = Object.fromEntries(localQuotes.map(q => [q.id || q.text, q]));
    const serverById = Object.fromEntries(serverQuotes.map(q => [q.id || q.text, q]));

    const merged = [];

    for (const key in serverById) {
      merged.push(serverById[key]);
      if (localById[key] && JSON.stringify(serverById[key]) !== JSON.stringify(localById[key])) {
        notifyConflict(serverById[key], localById[key]);
      }
    }

    for (const key in localById) {
      if (!serverById[key]) {
        merged.push(localById[key]);
      }
    }

    localStorage.setItem("quotes", JSON.stringify(merged));
    quotes = merged;
    populateCategories();
    showSyncStatus("Quotes synced from server");
  } catch (error) {
    console.error("Failed to fetch server quotes:", error);
    showSyncStatus("Server sync failed.");
  }
}

async function sendQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1
      })
    });

    const result = await response.json();
    console.log("Quote sent to server:", result);
    showSyncStatus(`Quote "${quote.text}" sent to server`);
  } catch (error) {
    console.error("Error sending quote to server:", error);
    showSyncStatus("Failed to send quote to server");
  }
}


async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and category.");
    return;
  }

  const newQuote = {
    id: Date.now(), // temporary ID
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");

  await sendQuoteToServer(newQuote); // ✅ Simulate pushing to server
}


function showSyncStatus(message) {
  const statusEl = document.getElementById("syncStatus");
  if (statusEl) {
    statusEl.textContent = `${message} (${new Date().toLocaleTimeString()})`;
  }
}







// Event Listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", () => {
  showRandomQuote();
});
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// Initialization
loadQuotes();
createAddQuoteForm();
populateCategories();
loadLastViewedQuote();
