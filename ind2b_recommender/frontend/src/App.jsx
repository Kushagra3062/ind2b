import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser, FaHistory, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your AI shopping assistant. Tell me what you are looking for.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse recent searches", e);
      return [];
    }
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (e) {
      console.error("Failed to save recent searches", e);
      // Optional: Clear storage if full?
    }
  }, [recentSearches]);

  const addToHistory = (query, products, type) => {
    const newItem = {
      id: Date.now(),
      query: query,
      products: products,
      type: type,
      timestamp: new Date().toISOString()
    };
    // Keep only last 20 items, prevent duplicates of exact same query at top
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.query !== query);
      return [newItem, ...filtered].slice(0, 20);
    });
  };

  const loadHistoryItem = (item) => {
    setMessages([
      { id: Date.now(), sender: 'user', text: item.query },
      { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: `Here are the ${item.type === 'search' ? 'results' : 'recommendations'} for "${item.query}":`,
        products: item.products,
        resultType: item.type 
      }
    ]);
  };

  const resetChat = () => {
    setMessages([
      { id: Date.now(), sender: 'bot', text: 'Chat reset. How can I help you today?' }
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/search`, { params: { q: query } });
      const products = res.data;

      if (products.length === 0) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: "I couldn't find any products matching that description. Try searching for something else like 'drill' or 'shirt'." 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `I found ${products.length} products for "${query}":`,
          products: products,
          resultType: 'search'
        }]);
        addToHistory(query, products, 'search');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "Sorry, I encountered an error while searching." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product, type) => {
    // If it's a search result -> Show recommendations
    if (type === 'search') {
        const userMsg = { id: Date.now(), sender: 'user', text: `Show me similar items to: ${product.title}` };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
          const res = await axios.get(`${API_BASE}/recommend/product/${product.product_id}`);
          const recommendations = res.data;

          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            sender: 'bot', 
            text: `Here are some recommendations based on "${product.title}":`,
            products: recommendations,
            resultType: 'recommendation'
          }]);
          addToHistory(`Similar to: ${product.title}`, recommendations, 'recommendation');
        } catch (err) {
          console.error(err);
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            sender: 'bot', 
            text: "Sorry, I couldn't get recommendations at this moment." 
          }]);
        } finally {
          setLoading(false);
        }
    } 
    // If it's already a recommendation -> and user clicks it -> Redirect to website
    else {
        // Create slug from title: lowercase, replace non-alphanumeric with hyphens, trim hyphens
        const slug = product.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        
        const url = `https://www.ind2b.com/products/${product.product_id}-${slug}`;
        window.open(url, '_blank');
    }
  };

  const clearHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('recentSearches');
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar for Recent Searches */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2><FaHistory /> Recent</h2>
        </div>
        <div className="recent-list">
          {(!Array.isArray(recentSearches) || recentSearches.length === 0) ? (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>No recent searches</div>
          ) : (
            recentSearches.filter(item => item && item.id).map(item => (
              <motion.div 
                key={item.id}
                className="recent-item"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadHistoryItem(item)}
              >
                <div className="recent-item-query" title={item.query}>{item.query || 'Unknown Query'}</div>
                <div className="recent-item-type">
                  {item.type || 'search'} • {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="reset-btn-container">
          <button className="reset-chat-btn" onClick={resetChat}>
            <FaTrash /> Reset Chat
          </button>
          <button className="clear-history-btn" onClick={clearHistory}>
            <FaHistory /> Clear History
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-container">
        <header className="chat-header">
          <img 
            src="https://www.ind2b.com/logo1.webp" 
            alt="IND2B Logo" 
            className="app-logo"
          />
        </header>
        
        <div className="messages-area">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                className={`message ${msg.sender}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {msg.text && <div className="bubble">{msg.text}</div>}
                
                {msg.products && (
                  <div className="product-grid">
                    {msg.products.map(product => (
                      <motion.div 
                        key={product.product_id} 
                        className="product-card"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleProductClick(product, msg.resultType)}
                      >
                        <img 
                          src={product.image_link || 'https://via.placeholder.com/150'} 
                          alt={product.title} 
                          className="product-image"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=No+Image'}}
                        />
                        <div className="product-info">
                          <div className="product-title" title={product.title}>{product.title}</div>
                          
                          {/* Price & Discount Section */}
                          <div className="product-pricing">
                            <span className="product-price">₹{product.price}</span>
                            {product.discount > 0 && (
                              <>
                                <span className="product-mrp">₹{Math.round(product.price / (1 - product.discount / 100))}</span>
                                <span className="product-discount">({product.discount}% OFF)</span>
                              </>
                            )}
                          </div>

                          {/* Meta Details */}
                          <div className="product-meta">
                             {product.stock > 0 ? (
                                <span className="product-stock in-stock">In Stock: {product.stock}</span>
                             ) : (
                                <span className="product-stock out-of-stock">Out of Stock</span>
                             )}
                             {product.category_name && <span className="product-category">{product.category_name}</span>}
                          </div>

                          {product.rating && <div className="product-rating">⭐ {product.rating}</div>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="bubble">Thinking...</div>
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="input-box" 
            placeholder="Type a product name..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="send-btn" disabled={loading}>
            <FaPaperPlane />
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
