// Initial quotes array
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Inspiration" }
];

// Populate category dropdown
function populateCategories() {
  const select = document.getElementById('categorySelect');
  const categories = new Set(quotes.map(q => q.category));
  select.innerHTML = '<option value="all">All</option>'; // Reset options
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

// Show a random quote (filtered by selected category)
function showRandomQuote() {
  const category = document.getElementById('categorySelect').value;
  const filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" — ${quote.category}`;
}

// Add new quote from input
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    populateCategories(); // Refresh dropdown
    textInput.value = '';
    categoryInput.value = '';
    alert("Quote added!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Set up event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initialize on load
populateCategories();

