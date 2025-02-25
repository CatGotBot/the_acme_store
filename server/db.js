// server/db.js
const pg = require('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const client = new pg.Client("postgres://kseniia:kseniya3@localhost:5432/the_acme_store");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE,
      password VARCHAR(100)
    );

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(50)
    );

    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT unique_product_user UNIQUE (product_id, user_id)
    );
  `;
  await client.query(SQL);
};

const createProduct = async (name) => {
  const SQL = `
    INSERT INTO products(id, name)
    VALUES($1, $2)
    RETURNING *;
  `;
  const result = await client.query(SQL, [uuid.v4(), name]);
  return result.rows[0];
};

const createUser = async (username, password) => {
  const SQL = `
    INSERT INTO users(id, username, password)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const hashedPassword = await bcrypt.hash(password, 5);
  const result = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
  return result.rows[0];
};

const createFavorite = async (user_id, product_id) => {
  const SQL = `
    INSERT INTO favorites(id, product_id, user_id)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const result = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return result.rows[0];
};

const fetchUsers = async () => {
  const SQL = `SELECT * FROM users;`;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchProducts = async () => {
  const SQL = `SELECT * FROM products;`;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchFavorites = async (user_id) => {
  const SQL = `
    SELECT favorites.*, products.name AS product_name
    FROM favorites
    JOIN products ON favorites.product_id = products.id
    WHERE favorites.user_id = $1;
  `;
  const result = await client.query(SQL, [user_id]);
  return result.rows;
};

const destroyFavorite = async (favoriteId) => {
  const SQL = `
    DELETE FROM favorites
    WHERE id = $1;
  `;
  await client.query(SQL, [favoriteId]);
};

const init = async () => {
  console.log("Initializing DB layer...");
  await client.connect();
  await createTables();

  const user1 = await createUser("smilingjoe", "password");
  const user2 = await createUser("frowningFrank", "password");

  const product1 = await createProduct("Acme Anvil");
  const product2 = await createProduct("Acme Rocket Skates");
  const product3 = await createProduct("Acme Dynamite");

  await createFavorite(user1.id, product1.id);
  console.log("Sample data inserted.");
};

module.exports = {
  init, 
  client,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite
};
