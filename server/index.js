const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json());

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await db.fetchUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const products = await db.fetchProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});


app.get('/api/users/:id/favorites', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const favorites = await db.fetchFavorites(userId);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
});


app.post('/api/users/:id/favorites', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { product_id } = req.body;
    const favorite = await db.createFavorite(userId, product_id);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
});


app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.destroyFavorite(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const init = async () => {
  await db.init();
  app.listen(3000, () => console.log('Listening on port 3000'));
};

init();
