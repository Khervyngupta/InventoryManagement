// Import necessary modules and libraries
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Create an instance of the Express application
const app = express();

// Configure the application to use JSON body parser
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'inventory'
});

// Define routes for CRUD operations
app.get('/items', (req, res) => {
  // Retrieve all items from the database
  pool.query('SELECT * FROM items', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.post('/items', (req, res) => {
  // Insert a new item into the database
  const { name, quantity, price } = req.body;
  pool.query('INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)', [name, quantity, price], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Item added successfully' });
    }
  });
});

app.put('/items/:id', (req, res) => {
  // Update an existing item in the database
  const { id } = req.params;
  const { name, quantity, price } = req.body;
  pool.query('UPDATE items SET name = ?, quantity = ?, price = ? WHERE id = ?', [name, quantity, price, id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Item updated successfully' });
    }
  });
});

app.delete('/items/:id', (req, res) => {
  // Delete an item from the database
  const { id } = req.params;
  pool.query('DELETE FROM items WHERE id = ?', [id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Item deleted successfully' });
    }
  });
});

app.get('/items/:id/details', (req, res) => {
  // Fetch item details from the external API
  const { id } = req.params;
  axios.get(`https://api.example.com/items/${id}`)
    .then(response => {
      // Store the fetched data in the local database
      const { price, supplier } = response.data;
      pool.query('INSERT INTO item_details (item_id, price, supplier) VALUES (?, ?, ?)', [id, price, supplier], (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.json(response.data);
        }
      });
    })
    .catch(error => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
