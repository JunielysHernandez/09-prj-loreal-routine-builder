# L'Oréal Smart Routine Builder 💄✨

A product-aware AI chatbot that helps users build personalized beauty routines using L'Oréal products. This application demonstrates the integration of product data, local storage, OpenAI API, and modern web technologies.

## 🌟 Features

### Core Features

1. **Product Browsing & Selection**

   - Load and display products from `products.json`
   - Interactive product cards with hover effects
   - Click to select/unselect products
   - Visual feedback with checkmarks and styling
   - Expandable product descriptions

2. **Smart Search & Filtering**

   - Search products by name, brand, category, or keywords
   - Category filter dropdown
   - Real-time filtering as you type
   - Combined search and category filtering

3. **Selected Products Management**

   - Selected products section with count
   - Remove individual products
   - Clear all selected products
   - Persistent storage using localStorage
   - Automatic restore on page reload

4. **AI-Powered Routine Generation**

   - Generate personalized routines based on selected products
   - Integration with OpenAI's GPT-4o model via Cloudflare Workers
   - Professional beauty advisor persona
   - Step-by-step routine instructions
   - Morning and evening routine recommendations

5. **Interactive Chat Interface**

   - Follow-up questions about routines and products
   - Contextual conversations with chat history
   - Real-time typing indicators
   - Professional AI responses
   - Fallback responses when API is unavailable

6. **Modern UI/UX**
   - L'Oréal brand colors (#ff003b red, #e3a535 gold)
   - Responsive design for all devices
   - Beautiful animations and transitions
   - Loading states and visual feedback
   - Professional typography and spacing

### Bonus Features

- **RTL (Right-to-Left) Support**: Layout adapts for Arabic/Hebrew languages
- **Web Search Integration**: Expandable for real-time information
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Optimized loading and minimal API calls

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A Cloudflare Workers account (for OpenAI API integration)
- OpenAI API key

### Setup Instructions

1. **Clone or Download the Project**

   ```bash
   git clone <repository-url>
   cd 09-prj-loreal-routine-builder
   ```

2. **Configure API Endpoint**

   - Edit `secrets.js`
   - Replace `CLOUDFLARE_WORKER_URL` with your actual Cloudflare Worker endpoint
   - Set up your Cloudflare Worker (see example in `secrets.js`)

3. **Set Up Cloudflare Worker**

   ```javascript
   // Example worker.js
   export default {
     async fetch(request, env, ctx) {
       if (request.method !== "POST") {
         return new Response("Method not allowed", { status: 405 });
       }

       try {
         const body = await request.json();

         const response = await fetch(
           "https://api.openai.com/v1/chat/completions",
           {
             method: "POST",
             headers: {
               Authorization: `Bearer ${env.OPENAI_API_KEY}`,
               "Content-Type": "application/json",
             },
             body: JSON.stringify(body),
           }
         );

         const data = await response.json();

         return new Response(JSON.stringify(data), {
           headers: {
             "Content-Type": "application/json",
             "Access-Control-Allow-Origin": "*",
             "Access-Control-Allow-Methods": "POST",
             "Access-Control-Allow-Headers": "Content-Type",
           },
         });
       } catch (error) {
         return new Response(
           JSON.stringify({ error: "Internal server error" }),
           {
             status: 500,
             headers: {
               "Content-Type": "application/json",
               "Access-Control-Allow-Origin": "*",
             },
           }
         );
       }
     },
   };
   ```

4. **Run the Application**
   - Open `index.html` in a web browser
   - Or use a local server:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

## 📁 Project Structure

```
├── index.html          # Main HTML structure
├── style.css           # Complete CSS with L'Oréal branding
├── script.js           # Full JavaScript functionality
├── secrets.js          # API configuration
├── products.json       # Product database
├── README.md           # Project documentation
└── img/
    └── loreal-logo.png # L'Oréal logo
```

## 🎯 How to Use

### Step 1: Browse Products

- Use the search bar to find specific products
- Filter by category using the dropdown
- Browse all available products

### Step 2: Select Products

- Click on product cards to select them
- Selected products show a checkmark
- Click "Show details" to see full descriptions
- Remove products by clicking the X in the selected section

### Step 3: Generate Routine

- Click "Generate Routine" with selected products
- Wait for AI to create your personalized routine
- Review the step-by-step recommendations

### Step 4: Ask Questions

- Use the chat interface for follow-up questions
- Ask about specific products or ingredients
- Get personalized beauty advice

## 🛠️ Technical Details

### Key JavaScript Concepts

- **Async/Await**: Used for API calls and data fetching
- **Local Storage**: Persistent product selections
- **Event Delegation**: Efficient event handling
- **Array Methods**: Filtering and mapping products
- **Template Literals**: Dynamic HTML generation
- **Error Handling**: Graceful API failure management

### API Integration

- Uses `fetch()` for HTTP requests
- Handles CORS with Cloudflare Workers
- Implements retry logic and fallbacks
- Maintains chat context and history

### Responsive Design

- CSS Grid and Flexbox layouts
- Mobile-first approach
- Smooth animations and transitions
- Accessible color contrast

## 🎨 L'Oréal Brand Guidelines

### Colors

- **Primary Red**: `#ff003b` - Used for buttons, accents, selected states
- **Gold**: `#e3a535` - Used for categories, highlights
- **Dark**: `#1a1a1a` - Main text color
- **Gray**: `#666` - Secondary text
- **Light**: `#f8f8f8` - Backgrounds

### Typography

- **Font**: Montserrat (Google Fonts)
- **Weights**: 300 (light), 500 (medium), 700 (bold)
- **Hierarchy**: Clear heading and body text distinction

## 🔧 Customization

### Adding New Products

Edit `products.json`:

```json
{
  "id": 999,
  "brand": "Brand Name",
  "name": "Product Name",
  "category": "category",
  "image": "image-url",
  "description": "Product description..."
}
```

### Modifying AI Prompts

Update the prompt in `script.js` `generateRoutine()` function:

```javascript
const prompt = `Your custom prompt here...`;
```

### Styling Changes

Modify CSS custom properties in `style.css`:

```css
:root {
  --loreal-red: #your-color;
  --loreal-gold: #your-color;
}
```

## 🌍 RTL Support

Enable RTL layout by adding `dir="rtl"` to the HTML element:

```html
<html lang="ar" dir="rtl"></html>
```

## 🚨 Troubleshooting

### Common Issues

1. **Products not loading**

   - Check console for fetch errors
   - Ensure `products.json` is accessible
   - Verify JSON syntax

2. **API not working**

   - Check Cloudflare Worker URL in `secrets.js`
   - Verify CORS headers in worker
   - Check OpenAI API key and permissions

3. **Styles not applying**
   - Check CSS file path
   - Verify CSS custom properties support
   - Clear browser cache

### Debug Mode

Open browser console to see detailed logs:

- Product loading status
- API request/response details
- Error messages and stack traces

## 📚 Learning Objectives

This project teaches:

- Modern JavaScript ES6+ features
- API integration and error handling
- Local storage and data persistence
- CSS Grid and Flexbox layouts
- Responsive web design principles
- UI/UX best practices
- Brand consistency implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. L'Oréal branding used with respect for demonstration only.

---

**Built with ❤️ for learning JavaScript, APIs, and modern web development**oject 9: L'Oréal Routine Builder
L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder.

Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.
