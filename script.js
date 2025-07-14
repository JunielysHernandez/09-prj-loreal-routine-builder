/* ======= L'Oréal Routine Builder - Complete JavaScript Implementation ======= */

/* Global variables to store products and selected items */
let allProducts = [];
let selectedProducts = [];
let chatHistory = [];

/* Get references to DOM elements */
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
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

/* Initialize the application when page loads */
document.addEventListener("DOMContentLoaded", async () => {
  // Load products from JSON file
  await loadProducts();

  // Show initial products (all categories)
  displayProducts(allProducts);

  // Load selected products from localStorage
  loadSelectedProductsFromStorage();

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
          <button class="expand-btn" onclick="toggleDescription(${product.id})">
            <span class="expand-text">Show details</span>
          </button>
          <div class="product-description" id="desc-${product.id}">
            ${product.description}
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

/* Toggle product description visibility */
function toggleDescription(productId) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const expandBtn = card.querySelector(".expand-btn .expand-text");

  if (card.classList.contains("expanded")) {
    card.classList.remove("expanded");
    expandBtn.textContent = "Show details";
  } else {
    card.classList.add("expanded");
    expandBtn.textContent = "Hide details";
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

/* Filter products based on search input and category */
function filterProducts() {
  const searchTerm = productSearch.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  let filteredProducts = allProducts;

  // Filter by category if selected
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  // Filter by search term if provided
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
  }

  displayProducts(filteredProducts);
}

/* Generate routine using selected products and OpenAI API */
async function generateRoutine() {
  if (selectedProducts.length === 0) {
    addChatMessage(
      "ai",
      "Please select some products first to generate a personalized routine!"
    );
    return;
  }

  // Show loading state
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
    /* Prepare selected products data for API */
    const productsData = selectedProducts.map((product) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
    }));

    /* Create prompt for OpenAI */
    const prompt = `As a professional beauty and skincare advisor, create a personalized routine using these selected products:

${productsData
  .map((p) => `- ${p.brand} ${p.name} (${p.category}): ${p.description}`)
  .join("\n")}

Please provide:
1. A step-by-step routine (morning and/or evening as appropriate)
2. The order of application
3. Any tips for best results
4. Frequency of use for each product

Keep the response helpful, professional, and personalized. Focus on the specific products selected.`;

    /* Call OpenAI API via Cloudflare Worker */
    const workerUrl =
      window.CLOUDFLARE_WORKER_URL || "YOUR_CLOUDFLARE_WORKER_URL";
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional L'Oréal beauty advisor. Provide helpful, accurate skincare and beauty advice.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const routineText = data.choices[0].message.content;

    /* Add the generated routine to chat */
    addChatMessage("ai", routineText);

    /* Add to chat history for context */
    chatHistory.push({
      role: "assistant",
      content: routineText,
      products: productsData,
    });
  } catch (error) {
    console.error("Error generating routine:", error);

    /* Fallback response if API fails */
    const fallbackRoutine = generateFallbackRoutine(selectedProducts);
    addChatMessage("ai", fallbackRoutine);
  } finally {
    /* Reset button state */
    generateRoutineBtn.disabled = false;
    generateRoutineBtn.innerHTML = `
      <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine
    `;
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

    /* Create messages array for API */
    const messages = [
      {
        role: "system",
        content: `You are a helpful L'Oréal beauty advisor. Help users with skincare, beauty, and product questions. Current context: ${selectedProductsContext}`,
      },
      ...context,
      {
        role: "user",
        content: message,
      },
    ];

    /* Call OpenAI API via Cloudflare Worker */
    const workerUrl =
      window.CLOUDFLARE_WORKER_URL || "YOUR_CLOUDFLARE_WORKER_URL";
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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

/* Set up all event listeners */
function setupEventListeners() {
  /* Search and filter events */
  productSearch.addEventListener("input", filterProducts);
  categoryFilter.addEventListener("change", filterProducts);

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
