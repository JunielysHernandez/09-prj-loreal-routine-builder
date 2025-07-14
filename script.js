/* ======= L'Oréal Routine Builder - Complete JavaScript Implementation ======= */

/* Global variables to store products and selected items */
let allProducts = [];
let selectedProducts = [];
let chatHistory = [];

/* Global variables for language support */
let currentLanguage = "en";
let isRTL = false;

/* Get references to DOM elements */
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const toggleAllDetailsBtn = document.getElementById("toggleAllDetails");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsSection = document.getElementById(
  "selectedProductsSection"
);
const selectedProductsList = document.getElementById("selectedProductsList");
const selectedCount = document.getElementById("selectedCount");
const clearSelectedBtn = document.getElementById("clearSelected");
const generateRoutineBtn = document.getElementById("generateRoutine");
const chatSection = document.getElementById("chatSection");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* Get reference to web search toggle */
const webSearchToggle = document.getElementById("enableWebSearch");

/* Get reference to language toggle button */
const languageToggle = document.getElementById("languageToggle");

/* Get references to all language buttons */
const englishBtn = document.getElementById("englishBtn");
const arabicBtn = document.getElementById("arabicBtn");
const frenchBtn = document.getElementById("frenchBtn");
const spanishBtn = document.getElementById("spanishBtn");

/* Language translations object - students can learn about data structures */
const translations = {
  en: {
    searchPlaceholder: "Search products by name or keyword...",
    allCategories: "All Categories",
    showAllDetails: "Show All Details",
    hideAllDetails: "Hide All Details",
    enableWebSearch: "Include web search in AI responses",
    generateRoutine: "Generate Routine",
    clearAll: "Clear All",
    noProductsSelected:
      "Please select some products first to generate a personalized routine!",
    errorLoading: "Error loading products. Please refresh the page.",
    noProductsFound: "No products found matching your criteria.",
  },
  ar: {
    searchPlaceholder: "ابحث عن المنتجات بالاسم أو الكلمة المفتاحية...",
    allCategories: "جميع الفئات",
    showAllDetails: "إظهار جميع التفاصيل",
    hideAllDetails: "إخفاء جميع التفاصيل",
    enableWebSearch: "تضمين البحث على الويب في ردود الذكاء الاصطناعي",
    generateRoutine: "إنشاء روتين",
    clearAll: "مسح الكل",
    noProductsSelected: "يرجى اختيار بعض المنتجات أولاً لإنشاء روتين شخصي!",
    errorLoading: "خطأ في تحميل المنتجات. يرجى تحديث الصفحة.",
    noProductsFound: "لم يتم العثور على منتجات تطابق معاييرك.",
  },
  fr: {
    searchPlaceholder: "Rechercher des produits par nom ou mot-clé...",
    allCategories: "Toutes les Catégories",
    showAllDetails: "Afficher Tous les Détails",
    hideAllDetails: "Masquer Tous les Détails",
    enableWebSearch: "Inclure la recherche web dans les réponses IA",
    generateRoutine: "Générer une Routine",
    clearAll: "Tout Effacer",
    noProductsSelected:
      "Veuillez d'abord sélectionner des produits pour générer une routine personnalisée!",
    errorLoading:
      "Erreur lors du chargement des produits. Veuillez actualiser la page.",
    noProductsFound: "Aucun produit trouvé correspondant à vos critères.",
  },
  es: {
    searchPlaceholder: "Buscar productos por nombre o palabra clave...",
    allCategories: "Todas las Categorías",
    showAllDetails: "Mostrar Todos los Detalles",
    hideAllDetails: "Ocultar Todos los Detalles",
    enableWebSearch: "Incluir búsqueda web en respuestas de IA",
    generateRoutine: "Generar Rutina",
    clearAll: "Borrar Todo",
    noProductsSelected:
      "¡Por favor selecciona algunos productos primero para generar una rutina personalizada!",
    errorLoading: "Error al cargar productos. Por favor recarga la página.",
    noProductsFound:
      "No se encontraron productos que coincidan con tus criterios.",
  },
};

/* Initialize the application when page loads */
document.addEventListener("DOMContentLoaded", async () => {
  // Load products from JSON file
  await loadProducts();

  // Show initial products (all categories)
  displayProducts(allProducts);

  // Load selected products from localStorage
  loadSelectedProductsFromStorage();

  // Load RTL language preference from localStorage
  loadRTLPreference();

  // Show chat section initially with welcome message
  chatSection.style.display = "block";

  // Set up event listeners
  setupEventListeners();
});

/* Load product data from JSON file */
async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products;
    console.log(`Loaded ${allProducts.length} products successfully`);
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Error loading products. Please refresh the page.
      </div>
    `;
  }
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No products found matching your criteria.
      </div>
    `;
    return;
  }

  /* Create product cards with clickable functionality and expand/collapse */
  productsContainer.innerHTML = products
    .map(
      (product) => `
      <div class="product-card ${
        isProductSelected(product.id) ? "selected" : ""
      }" 
           data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <div class="product-brand">${product.brand}</div>
          <h3>${product.name}</h3>
          <div class="product-category">${product.category}</div>
          <button class="expand-btn" data-product-id="${product.id}">
            <span class="expand-text">SHOW DETAILS</span>
          </button>
          <div class="product-description" id="desc-${product.id}">
            <p><strong>About this product:</strong></p>
            <p>${product.description}</p>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  /* Add event listeners for expand buttons after creating the HTML */
  addExpandButtonListeners();
}

/* Add event listeners for expand/collapse buttons */
function addExpandButtonListeners() {
  const expandButtons = document.querySelectorAll(".expand-btn");
  expandButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent product selection when clicking expand button
      const productId = button.getAttribute("data-product-id");
      toggleDescription(productId);
    });
  });
}

/* Toggle product description visibility */
function toggleDescription(productId) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const expandBtn = card.querySelector(".expand-btn .expand-text");

  if (card.classList.contains("expanded")) {
    card.classList.remove("expanded");
    expandBtn.textContent = "SHOW DETAILS";
  } else {
    card.classList.add("expanded");
    expandBtn.textContent = "HIDE DETAILS";
  }
}

/* Toggle all product details at once */
function toggleAllProductDetails() {
  const productCards = document.querySelectorAll(".product-card");
  const translation = translations[currentLanguage];

  if (allDetailsExpanded) {
    /* Hide all details */
    productCards.forEach((card) => {
      card.classList.remove("expanded");
      const expandBtn = card.querySelector(".expand-btn .expand-text");
      if (expandBtn) {
        expandBtn.textContent = "SHOW DETAILS"; // Keep English for product cards
      }
    });

    /* Update button with translated text */
    toggleAllDetailsBtn.innerHTML = `<i class="fa-solid fa-eye"></i> ${translation.showAllDetails}`;
    allDetailsExpanded = false;
  } else {
    /* Show all details */
    productCards.forEach((card) => {
      card.classList.add("expanded");
      const expandBtn = card.querySelector(".expand-btn .expand-text");
      if (expandBtn) {
        expandBtn.textContent = "HIDE DETAILS"; // Keep English for product cards
      }
    });

    /* Update button with translated text */
    toggleAllDetailsBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> ${translation.hideAllDetails}`;
    allDetailsExpanded = true;
  }
}

/* Check if a product is already selected */
function isProductSelected(productId) {
  return selectedProducts.some((product) => product.id === productId);
}

/* Handle product card clicks to select/unselect products */
function handleProductClick(event) {
  // Don't trigger if clicking on the expand button
  if (
    event.target.classList.contains("expand-btn") ||
    event.target.classList.contains("expand-text")
  ) {
    return;
  }

  const card = event.target.closest(".product-card");
  if (!card) return;

  const productId = parseInt(card.dataset.productId);
  const product = allProducts.find((p) => p.id === productId);

  if (!product) return;

  if (isProductSelected(productId)) {
    // Remove product from selection
    removeProductFromSelection(productId);
    card.classList.remove("selected");
  } else {
    // Add product to selection
    addProductToSelection(product);
    card.classList.add("selected");
  }

  updateSelectedProductsDisplay();
  saveSelectedProductsToStorage();
}

/* Add product to selected products array */
function addProductToSelection(product) {
  if (!isProductSelected(product.id)) {
    selectedProducts.push(product);
  }
}

/* Remove product from selected products array */
function removeProductFromSelection(productId) {
  selectedProducts = selectedProducts.filter(
    (product) => product.id !== productId
  );
}

/* Update the selected products display section */
function updateSelectedProductsDisplay() {
  selectedCount.textContent = selectedProducts.length;

  if (selectedProducts.length === 0) {
    selectedProductsSection.style.display = "none";
    return;
  }

  selectedProductsSection.style.display = "block";

  /* Create selected product items with remove buttons */
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="selected-product-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="selected-product-info">
          <h4>${product.name}</h4>
          <p>${product.brand} - ${product.category}</p>
        </div>
        <button class="remove-product-btn" onclick="removeSelectedProduct(${product.id})">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `
    )
    .join("");

  /* Enable/disable generate routine button */
  generateRoutineBtn.disabled = selectedProducts.length === 0;
}

/* Remove a product from selection (called by remove button) */
function removeSelectedProduct(productId) {
  removeProductFromSelection(productId);
  updateSelectedProductsDisplay();
  saveSelectedProductsToStorage();

  // Update product card visual state
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  if (card) {
    card.classList.remove("selected");
  }
}

/* Clear all selected products */
function clearAllSelectedProducts() {
  selectedProducts = [];
  updateSelectedProductsDisplay();
  saveSelectedProductsToStorage();

  // Remove selected class from all product cards
  document.querySelectorAll(".product-card.selected").forEach((card) => {
    card.classList.remove("selected");
  });
}

/* Save selected products to localStorage */
function saveSelectedProductsToStorage() {
  try {
    localStorage.setItem(
      "loreal-selected-products",
      JSON.stringify(selectedProducts)
    );
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/* Load selected products from localStorage */
function loadSelectedProductsFromStorage() {
  try {
    const saved = localStorage.getItem("loreal-selected-products");
    if (saved) {
      selectedProducts = JSON.parse(saved);
      updateSelectedProductsDisplay();
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    selectedProducts = [];
  }
}

/* Enhanced filter products with better search functionality */
function filterProducts() {
  // Get the search term and convert to lowercase for case-insensitive search
  const searchTerm = productSearch.value.toLowerCase().trim();
  // Get the selected category from dropdown
  const selectedCategory = categoryFilter.value;

  // Start with all products
  let filteredProducts = allProducts;

  // First, filter by category if one is selected
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  // Then, filter by search term if user typed something
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) => {
      // Search in multiple fields for better results
      const searchInName = product.name.toLowerCase().includes(searchTerm);
      const searchInBrand = product.brand.toLowerCase().includes(searchTerm);
      const searchInDescription = product.description
        .toLowerCase()
        .includes(searchTerm);
      const searchInCategory = product.category
        .toLowerCase()
        .includes(searchTerm);

      // Return true if search term is found in any field
      return (
        searchInName || searchInBrand || searchInDescription || searchInCategory
      );
    });
  }

  // Display the filtered results
  displayProducts(filteredProducts);

  // Reset the toggle all details state when filtering
  allDetailsExpanded = false;
  toggleAllDetailsBtn.innerHTML =
    '<i class="fa-solid fa-eye"></i> Show All Details';

  // Show helpful message if no products found
  if (filteredProducts.length === 0 && (searchTerm || selectedCategory)) {
    const message = searchTerm
      ? `No products found for "${searchTerm}"`
      : `No products found in "${selectedCategory}" category`;

    productsContainer.innerHTML = `
      <div class="placeholder-message">
        <i class="fa-solid fa-search"></i>
        <p>${message}</p>
        <p>Try a different search term or category.</p>
      </div>
    `;
  }
}

/* Add real-time search with debouncing for better performance */
let searchTimeout;
function setupSearchWithDebounce() {
  productSearch.addEventListener("input", () => {
    // Clear the previous timeout
    clearTimeout(searchTimeout);

    // Set a new timeout to search after user stops typing
    searchTimeout = setTimeout(() => {
      filterProducts();
    }, 300); // Wait 300ms after user stops typing
  });
}

/* Function to search the web for current information */
async function searchWeb(query) {
  try {
    // Using DuckDuckGo Instant Answer API (free, no API key needed)
    // This is perfect for beginners as it's simple and free to use
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_html=1&skip_disambig=1`;

    console.log("Searching web for:", query); // Help students see what's being searched

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Extract useful information from the response
    let searchResults = {
      abstract: data.Abstract || "",
      abstractUrl: data.AbstractURL || "",
      relatedTopics: data.RelatedTopics || [],
      answer: data.Answer || "",
    };

    console.log("Web search results:", searchResults); // Help students understand the data

    return searchResults;
  } catch (error) {
    console.error("Web search error:", error);
    return null;
  }
}

/* Function to format web search results for AI context */
function formatWebSearchForAI(searchResults, query) {
  if (!searchResults) {
    return "";
  }

  let webContext = `\n\n--- Current Web Information for "${query}" ---\n`;

  // Add abstract information if available
  if (searchResults.abstract) {
    webContext += `Current information: ${searchResults.abstract}\n`;
    if (searchResults.abstractUrl) {
      webContext += `Source: ${searchResults.abstractUrl}\n`;
    }
  }

  // Add answer if available
  if (searchResults.answer) {
    webContext += `Quick answer: ${searchResults.answer}\n`;
  }

  // Add related topics
  if (searchResults.relatedTopics && searchResults.relatedTopics.length > 0) {
    webContext += `Related topics: ${searchResults.relatedTopics
      .slice(0, 3)
      .map((topic) => topic.Text)
      .join(", ")}\n`;
  }

  webContext += `--- End Web Information ---\n\n`;

  return webContext;
}

/* Function to add clickable links to AI responses */
function addLinksToResponse(responseText, searchResults) {
  if (!searchResults) {
    return responseText;
  }

  let enhancedResponse = responseText;

  // Add a "Sources" section at the end if we have URLs
  if (searchResults.abstractUrl) {
    enhancedResponse += `\n\n**Sources:**\n`;
    enhancedResponse += `• [Learn more about this topic](${searchResults.abstractUrl})\n`;
  }

  // Add related topic links if available
  if (searchResults.relatedTopics && searchResults.relatedTopics.length > 0) {
    enhancedResponse += `\n**Related Information:**\n`;
    searchResults.relatedTopics.slice(0, 2).forEach((topic) => {
      if (topic.FirstURL) {
        enhancedResponse += `• [${topic.Text}](${topic.FirstURL})\n`;
      }
    });
  }

  return enhancedResponse;
}

/* Enhanced generate routine function with web search */
async function generateRoutine() {
  const translation = translations[currentLanguage];

  /* Check if user selected any products */
  if (selectedProducts.length === 0) {
    addChatMessage("ai", translation.noProductsSelected);
    return;
  }

  /* Show loading state with current language */
  generateRoutineBtn.disabled = true;
  generateRoutineBtn.innerHTML = `
    <div class="loading">
      <span>Generating routine</span>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  try {
    /* Step 1: Prepare selected products data for OpenAI */
    const productsData = selectedProducts.map((product) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
    }));

    console.log("Selected products:", productsData);

    /* Step 2: Perform web search if enabled */
    let webSearchResults = null;
    let webContext = "";

    if (webSearchToggle.checked) {
      console.log(
        "Web search is enabled - searching for current beauty trends..."
      );

      // Create a search query based on selected products
      const searchQuery = `${productsData[0].category} skincare routine trends 2025`;
      webSearchResults = await searchWeb(searchQuery);
      webContext = formatWebSearchForAI(webSearchResults, searchQuery);

      console.log("Web search context added:", webContext);
    }

    /* Step 3: Create enhanced prompt with web search context */
    const basePrompt = `As a professional L'Oréal beauty advisor, create a personalized routine using these selected products:

${productsData
  .map((p) => `- ${p.brand} ${p.name} (${p.category}): ${p.description}`)
  .join("\n")}

${webContext}

Please provide:
1. A step-by-step routine (morning and/or evening as appropriate)
2. The order of application for these specific products
3. Tips for best results with these L'Oréal products
4. Frequency of use for each product
${
  webSearchResults
    ? "5. Any current trends or updates mentioned in the web information above"
    : ""
}

Keep the response helpful, professional, and personalized to these specific L'Oréal products.`;

    /* Step 4: Prepare the request data for OpenAI's API */
    const requestData = {
      model: "gpt-4o", // Using OpenAI's latest model
      messages: [
        {
          role: "system",
          content:
            "You are a professional L'Oréal beauty advisor. Provide helpful, accurate skincare and beauty advice using L'Oréal products. If web search information is provided, incorporate current trends and information into your advice.",
        },
        {
          role: "user",
          content: basePrompt,
        },
      ],
      max_tokens: 1200, // Increased for web search content
      temperature: 0.7,
    };

    console.log("Sending request to Cloudflare Worker...");

    /* Step 5: Send request to your Cloudflare Worker */
    const response = await fetch(window.CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Worker response status:", response.status);

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    /* Step 6: Get the response from OpenAI */
    const data = await response.json();
    console.log("OpenAI response:", data);

    // Extract the AI's message from the response
    let routineText = data.choices[0].message.content;

    /* Step 7: Add web search links to the response if available */
    if (webSearchResults && webSearchToggle.checked) {
      routineText = addLinksToResponse(routineText, webSearchResults);
    }

    /* Step 8: Add the enhanced routine to chat */
    addChatMessage("ai", routineText);

    /* Step 9: Add to chat history for future questions */
    chatHistory.push({
      role: "assistant",
      content: routineText,
      products: productsData,
      webSearchUsed: webSearchToggle.checked,
    });

    console.log("Enhanced routine generated successfully!");
  } catch (error) {
    console.error("Error generating routine:", error);

    /* Fallback response if API fails */
    const fallbackRoutine = generateFallbackRoutine(selectedProducts);
    addChatMessage(
      "ai",
      `I'm having trouble connecting to the AI service right now, but here's a helpful routine based on your selected products:\n\n${fallbackRoutine}`
    );
  } finally {
    /* Reset button state so user can try again */
    generateRoutineBtn.disabled = false;
    generateRoutineBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${translation.generateRoutine}`;
  }
}

/* Generate a fallback routine when API is not available */
function generateFallbackRoutine(products) {
  const cleansers = products.filter((p) => p.category === "cleanser");
  const moisturizers = products.filter((p) => p.category === "moisturizer");
  const skincare = products.filter((p) => p.category === "skincare");
  const others = products.filter(
    (p) => !["cleanser", "moisturizer", "skincare"].includes(p.category)
  );

  let routine = "## Your Personalized L'Oréal Routine\n\n";

  if (cleansers.length > 0 || moisturizers.length > 0 || skincare.length > 0) {
    routine += "### Morning Routine:\n";
    if (cleansers.length > 0) {
      routine += `1. **Cleanse**: Start with ${cleansers[0].brand} ${cleansers[0].name}\n`;
    }
    if (skincare.length > 0) {
      routine += `2. **Treatment**: Apply ${skincare[0].brand} ${skincare[0].name}\n`;
    }
    if (moisturizers.length > 0) {
      routine += `3. **Moisturize**: Finish with ${moisturizers[0].brand} ${moisturizers[0].name}\n`;
    }

    routine += "\n### Evening Routine:\n";
    if (cleansers.length > 0) {
      routine += `1. **Cleanse**: Use ${cleansers[0].brand} ${cleansers[0].name} to remove makeup and impurities\n`;
    }
    if (skincare.length > 1) {
      routine += `2. **Treatment**: Apply ${skincare[1].brand} ${skincare[1].name}\n`;
    } else if (skincare.length > 0) {
      routine += `2. **Treatment**: Apply ${skincare[0].brand} ${skincare[0].name}\n`;
    }
    if (moisturizers.length > 1) {
      routine += `3. **Night Care**: Use ${moisturizers[1].brand} ${moisturizers[1].name}\n`;
    } else if (moisturizers.length > 0) {
      routine += `3. **Moisturize**: Apply ${moisturizers[0].brand} ${moisturizers[0].name}\n`;
    }
  }

  if (others.length > 0) {
    routine += "\n### Additional Products:\n";
    others.forEach((product) => {
      routine += `- **${product.brand} ${product.name}**: Use as directed for ${product.category}\n`;
    });
  }

  routine += "\n### Tips:\n";
  routine += "- Always patch test new products\n";
  routine += "- Use SPF during the day\n";
  routine += "- Be consistent with your routine for best results\n";
  routine += "- Introduce new products gradually\n";

  return routine;
}

/* Handle chat form submission */
async function handleChatSubmit(event) {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  /* Add user message to chat */
  addChatMessage("user", message);

  /* Clear input and disable form */
  userInput.value = "";
  sendBtn.disabled = true;

  /* Show typing indicator */
  const typingId = addTypingIndicator();

  try {
    /* Prepare context with selected products and chat history */
    const context = chatHistory.slice(-5); // Last 5 messages for context
    const selectedProductsContext =
      selectedProducts.length > 0
        ? `Selected products: ${selectedProducts
            .map((p) => `${p.brand} ${p.name}`)
            .join(", ")}`
        : "No products currently selected";

    /* Perform web search if enabled and question seems to need current info */
    let webContext = "";
    let webSearchResults = null;

    if (webSearchToggle.checked && needsWebSearch(message)) {
      console.log("Performing web search for chat question...");
      const searchQuery = extractSearchQuery(message);
      webSearchResults = await searchWeb(searchQuery);
      webContext = formatWebSearchForAI(webSearchResults, searchQuery);
    }

    /* Create messages array for API */
    const messages = [
      {
        role: "system",
        content: `You are a helpful L'Oréal beauty advisor. Help users with skincare, beauty, and product questions. Current context: ${selectedProductsContext}${
          webContext ? "\n\nCurrent web information:\n" + webContext : ""
        }`,
      },
      ...context,
      {
        role: "user",
        content: message,
      },
    ];

    /* Call OpenAI API via Cloudflare Worker */
    const response = await fetch(window.CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    /* Add web search links if available */
    if (webSearchResults && webSearchToggle.checked) {
      aiResponse = addLinksToResponse(aiResponse, webSearchResults);
    }

    /* Remove typing indicator and add AI response */
    removeTypingIndicator(typingId);
    addChatMessage("ai", aiResponse);

    /* Add to chat history */
    chatHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: aiResponse }
    );
  } catch (error) {
    console.error("Error sending message:", error);

    /* Remove typing indicator and show error */
    removeTypingIndicator(typingId);

    /* Provide helpful fallback responses */
    const fallbackResponse = getFallbackResponse(message);
    addChatMessage("ai", fallbackResponse);
  } finally {
    /* Re-enable form */
    sendBtn.disabled = false;
    userInput.focus();
  }
}

/* Helper function to determine if a question needs web search */
function needsWebSearch(message) {
  const webSearchKeywords = [
    "latest",
    "new",
    "recent",
    "current",
    "trending",
    "popular",
    "2025",
    "2024",
    "this year",
    "nowadays",
    "today",
    "what's new",
    "what are the trends",
    "latest products",
  ];

  const lowerMessage = message.toLowerCase();
  return webSearchKeywords.some((keyword) => lowerMessage.includes(keyword));
}

/* Helper function to extract search query from user message */
function extractSearchQuery(message) {
  // Simple keyword extraction - in a real app you might use more sophisticated NLP
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("skincare")) {
    return "latest skincare trends 2025";
  } else if (lowerMessage.includes("makeup")) {
    return "makeup trends 2025";
  } else if (lowerMessage.includes("hair")) {
    return "hair care trends 2025";
  } else {
    return "beauty trends 2025";
  }
}

/* Get fallback response when API is not available */
function getFallbackResponse(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.includes("routine") || message.includes("order")) {
    return "I'd love to help you create a routine! Please select some products above and click 'Generate Routine' for a personalized recommendation.";
  } else if (message.includes("product") || message.includes("recommend")) {
    return "I can help you find the right products! Browse our selection above and feel free to ask about specific ingredients or concerns.";
  } else if (message.includes("skin") || message.includes("face")) {
    return "For skincare advice, I recommend starting with a gentle cleanser, followed by treatments like serums, and finishing with a moisturizer. Don't forget SPF during the day!";
  } else if (message.includes("hello") || message.includes("hi")) {
    return "Hello! I'm your L'Oréal beauty advisor. I can help you build a personalized routine, answer product questions, and provide beauty tips. What would you like to know?";
  } else {
    return "I'm here to help with beauty and skincare questions! Try asking about routines, product recommendations, or specific concerns. You can also select products above to get personalized advice.";
  }
}

/* Add a message to the chat window */
function addChatMessage(sender, content) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${sender}-message`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "You" : "AI";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.innerHTML = formatMessageContent(content);

  if (sender === "user") {
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(avatar);
  } else {
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
  }

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Format message content (handle markdown-like formatting) */
function formatMessageContent(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/###\s(.*?)$/gm, "<h4>$1</h4>") // H4
    .replace(/##\s(.*?)$/gm, "<h3>$1</h3>") // H3
    .replace(/^-\s(.*)$/gm, "• $1") // Bullet points
    .replace(/^\d+\.\s(.*)$/gm, '<span style="font-weight: 500;">$&</span>') // Numbered lists
    .replace(/\n/g, "<br>"); // Line breaks
}

/* Add typing indicator */
function addTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-message ai-message typing-indicator";
  typingDiv.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-content loading">
      <span>Typing</span>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return typingDiv;
}

/* Remove typing indicator */
function removeTypingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

/* Function to toggle between RTL and LTR layouts */
function toggleRTL() {
  const html = document.documentElement;

  if (isRTL) {
    // Switch to LTR (English)
    html.removeAttribute("dir");
    html.setAttribute("lang", "en");
    languageToggle.innerHTML =
      '<i class="fa-solid fa-language"></i> العربية (Arabic)';
    isRTL = false;
    console.log("Switched to LTR (English) layout"); // Help students understand what happened
  } else {
    // Switch to RTL (Arabic)
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ar");
    languageToggle.innerHTML = '<i class="fa-solid fa-language"></i> English';
    isRTL = true;
    console.log("Switched to RTL (Arabic) layout"); // Help students understand what happened
  }

  // Save language preference to localStorage so it persists
  localStorage.setItem("loreal-rtl-preference", isRTL.toString());
}

/* Function to load RTL preference when page loads */
function loadRTLPreference() {
  try {
    // Check if user had a language preference saved
    const savedRTL = localStorage.getItem("loreal-rtl-preference");
    if (savedRTL === "true") {
      // User previously chose RTL, so switch to it
      toggleRTL();
    }
    console.log("RTL preference loaded from localStorage"); // Help students understand persistence
  } catch (error) {
    console.error("Error loading RTL preference:", error);
  }
}

/* Function to change language and update interface */
function changeLanguage(langCode) {
  console.log(`Changing language to: ${langCode}`); // Help students understand what's happening

  const html = document.documentElement;
  const translation = translations[langCode];

  /* Update global language variables */
  currentLanguage = langCode;
  isRTL = langCode === "ar"; // Only Arabic is RTL in our supported languages

  /* Set HTML attributes for language and direction */
  html.setAttribute("lang", langCode);

  if (isRTL) {
    html.setAttribute("dir", "rtl");
  } else {
    html.removeAttribute("dir");
  }

  /* Update all the interface text elements */
  updateInterfaceText(translation);

  /* Update active button styling */
  updateActiveLanguageButton(langCode);

  /* Save language preference to localStorage */
  localStorage.setItem("loreal-language-preference", langCode);

  console.log(`Language changed to ${langCode}, RTL: ${isRTL}`);
}

/* Function to update all text elements in the interface */
function updateInterfaceText(translation) {
  /* Update search placeholder */
  const searchInput = document.getElementById("productSearch");
  if (searchInput) {
    searchInput.placeholder = translation.searchPlaceholder;
  }

  /* Update category filter first option */
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter && categoryFilter.options[0]) {
    categoryFilter.options[0].textContent = translation.allCategories;
  }

  /* Update toggle all details button */
  const toggleAllBtn = document.getElementById("toggleAllDetails");
  if (toggleAllBtn) {
    const isExpanded = toggleAllBtn.innerHTML.includes("eye-slash");
    toggleAllBtn.innerHTML = `<i class="fa-solid fa-${
      isExpanded ? "eye-slash" : "eye"
    }"></i> ${
      isExpanded ? translation.hideAllDetails : translation.showAllDetails
    }`;
  }

  /* Update web search toggle text */
  const webSearchLabel = document.querySelector(".toggle-text");
  if (webSearchLabel) {
    webSearchLabel.innerHTML = `<i class="fa-solid fa-globe"></i> ${translation.enableWebSearch}`;
  }

  /* Update generate routine button */
  const generateBtn = document.getElementById("generateRoutine");
  if (generateBtn && !generateBtn.disabled) {
    generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${translation.generateRoutine}`;
  }

  /* Update clear all button */
  const clearBtn = document.getElementById("clearSelected");
  if (clearBtn) {
    clearBtn.textContent = translation.clearAll;
  }
}

/* Function to update which language button is active */
function updateActiveLanguageButton(langCode) {
  /* Remove active class from all buttons */
  document.querySelectorAll(".language-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  /* Add active class to selected language button */
  const activeBtn = document.querySelector(`[data-lang="${langCode}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

/* Function to load language preference when page loads */
function loadLanguagePreference() {
  try {
    /* Check if user had a language preference saved */
    const savedLanguage = localStorage.getItem("loreal-language-preference");
    if (savedLanguage && translations[savedLanguage]) {
      /* User had a saved preference, use it */
      changeLanguage(savedLanguage);
    } else {
      /* No saved preference, default to English */
      changeLanguage("en");
    }
    console.log("Language preference loaded from localStorage");
  } catch (error) {
    console.error("Error loading language preference:", error);
    /* If there's an error, default to English */
    changeLanguage("en");
  }
}

/* Updated toggle all product details function with translation support */
function toggleAllProductDetails() {
  const productCards = document.querySelectorAll(".product-card");
  const translation = translations[currentLanguage];

  if (allDetailsExpanded) {
    /* Hide all details */
    productCards.forEach((card) => {
      card.classList.remove("expanded");
      const expandBtn = card.querySelector(".expand-btn .expand-text");
      if (expandBtn) {
        expandBtn.textContent = "SHOW DETAILS"; // Keep English for product cards
      }
    });

    /* Update button with translated text */
    toggleAllDetailsBtn.innerHTML = `<i class="fa-solid fa-eye"></i> ${translation.showAllDetails}`;
    allDetailsExpanded = false;
  } else {
    /* Show all details */
    productCards.forEach((card) => {
      card.classList.add("expanded");
      const expandBtn = card.querySelector(".expand-btn .expand-text");
      if (expandBtn) {
        expandBtn.textContent = "HIDE DETAILS"; // Keep English for product cards
      }
    });

    /* Update button with translated text */
    toggleAllDetailsBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> ${translation.hideAllDetails}`;
    allDetailsExpanded = true;
  }
}

/* Updated generate routine function with translation support */
async function generateRoutine() {
  const translation = translations[currentLanguage];

  /* Check if user selected any products */
  if (selectedProducts.length === 0) {
    addChatMessage("ai", translation.noProductsSelected);
    return;
  }

  /* Show loading state with current language */
  generateRoutineBtn.disabled = true;
  generateRoutineBtn.innerHTML = `
    <div class="loading">
      <span>Generating routine</span>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  try {
    /* Step 1: Prepare selected products data for OpenAI */
    const productsData = selectedProducts.map((product) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
    }));

    console.log("Selected products:", productsData);

    /* Step 2: Perform web search if enabled */
    let webSearchResults = null;
    let webContext = "";

    if (webSearchToggle.checked) {
      console.log(
        "Web search is enabled - searching for current beauty trends..."
      );

      // Create a search query based on selected products
      const searchQuery = `${productsData[0].category} skincare routine trends 2025`;
      webSearchResults = await searchWeb(searchQuery);
      webContext = formatWebSearchForAI(webSearchResults, searchQuery);

      console.log("Web search context added:", webContext);
    }

    /* Step 3: Create enhanced prompt with web search context */
    const basePrompt = `As a professional L'Oréal beauty advisor, create a personalized routine using these selected products:

${productsData
  .map((p) => `- ${p.brand} ${p.name} (${p.category}): ${p.description}`)
  .join("\n")}

${webContext}

Please provide:
1. A step-by-step routine (morning and/or evening as appropriate)
2. The order of application for these specific products
3. Tips for best results with these L'Oréal products
4. Frequency of use for each product
${
  webSearchResults
    ? "5. Any current trends or updates mentioned in the web information above"
    : ""
}

Keep the response helpful, professional, and personalized to these specific L'Oréal products.`;

    /* Step 4: Prepare the request data for OpenAI's API */
    const requestData = {
      model: "gpt-4o", // Using OpenAI's latest model
      messages: [
        {
          role: "system",
          content:
            "You are a professional L'Oréal beauty advisor. Provide helpful, accurate skincare and beauty advice using L'Oréal products. If web search information is provided, incorporate current trends and information into your advice.",
        },
        {
          role: "user",
          content: basePrompt,
        },
      ],
      max_tokens: 1200, // Increased for web search content
      temperature: 0.7,
    };

    console.log("Sending request to Cloudflare Worker...");

    /* Step 5: Send request to your Cloudflare Worker */
    const response = await fetch(window.CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Worker response status:", response.status);

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    /* Step 6: Get the response from OpenAI */
    const data = await response.json();
    console.log("OpenAI response:", data);

    // Extract the AI's message from the response
    let routineText = data.choices[0].message.content;

    /* Step 7: Add web search links to the response if available */
    if (webSearchResults && webSearchToggle.checked) {
      routineText = addLinksToResponse(routineText, webSearchResults);
    }

    /* Step 8: Add the enhanced routine to chat */
    addChatMessage("ai", routineText);

    /* Step 9: Add to chat history for future questions */
    chatHistory.push({
      role: "assistant",
      content: routineText,
      products: productsData,
      webSearchUsed: webSearchToggle.checked,
    });

    console.log("Enhanced routine generated successfully!");
  } catch (error) {
    console.error("Error generating routine:", error);

    /* Fallback response if API fails */
    const fallbackRoutine = generateFallbackRoutine(selectedProducts);
    addChatMessage(
      "ai",
      `I'm having trouble connecting to the AI service right now, but here's a helpful routine based on your selected products:\n\n${fallbackRoutine}`
    );
  } finally {
    /* Reset button state so user can try again */
    generateRoutineBtn.disabled = false;
    generateRoutineBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${translation.generateRoutine}`;
  }
}

/* Set up all event listeners including language buttons */
function setupEventListeners() {
  /* Enhanced search with debouncing */
  setupSearchWithDebounce();

  /* Category filter */
  categoryFilter.addEventListener("change", filterProducts);

  /* Toggle all details button */
  toggleAllDetailsBtn.addEventListener("click", toggleAllProductDetails);

  /* Language buttons - each button changes to its specific language */
  englishBtn.addEventListener("click", () => changeLanguage("en"));
  arabicBtn.addEventListener("click", () => changeLanguage("ar"));
  frenchBtn.addEventListener("click", () => changeLanguage("fr"));
  spanishBtn.addEventListener("click", () => changeLanguage("es"));

  /* Product card clicks for selection */
  productsContainer.addEventListener("click", handleProductClick);

  /* Selected products actions */
  clearSelectedBtn.addEventListener("click", clearAllSelectedProducts);
  generateRoutineBtn.addEventListener("click", generateRoutine);

  /* Chat form submission */
  chatForm.addEventListener("submit", handleChatSubmit);

  /* Focus input when clicking in chat area */
  chatWindow.addEventListener("click", () => userInput.focus());
}
