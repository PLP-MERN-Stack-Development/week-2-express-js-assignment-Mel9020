require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '1234';

app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth Middleware
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }
  next();
});

let products = [
  { id: 1, name: 'Book', description: 'A book', price: 10, category: 'Education', inStock: true },
  { id: 2, name: 'Phone', description: 'Smartphone', price: 199, category: 'Electronics', inStock: true }
];

// Home route
app.get('/', (req, res) => {
  res.send('Simple Express API');
});

// Get all products with filter/search/pagination
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, search, page = 1, limit = 2 } = req.query;

  if (category) result = result.filter(p => p.category === category);
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const start = (page - 1) * limit;
  const end = start + Number(limit);
  res.json(result.slice(start, end));
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || typeof price !== 'number' || !category || typeof inStock !== 'boolean') {
    return res.status(400).json({ message: 'Invalid product data' });
  }
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const updated = { ...products[index], ...req.body };
  products[index] = updated;
  res.json(updated);
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  products = products.filter(p => p.id != req.params.id);
  res.json({ message: 'Product deleted' });
});

// Stats route
app.get('/api/products/stats/count-by-category', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
