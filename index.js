const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
// Specify the directory for EJS templates
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files (CSS, JS, images)
app.use(express.static('public_html'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./site.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Route: Home Page
app.get('/', (req, res) => {
  const productQuery = 'SELECT * FROM products ORDER BY sold_quantity DESC LIMIT 3';
  const serviceQuery = 'SELECT * FROM services';

  db.all(productQuery, [], (err, products) => {
    if (err) {
      console.error('Database error (products):', err.message);
      return res.status(500).send('Failed to retrieve products.');
    }

    db.all(serviceQuery, [], (err, services) => {
      if (err) {
        console.error('Database error (services):', err.message);
        return res.status(500).send('Failed to retrieve services.');
      }

      res.render('home', { username: null, products, services });
    });
  });
});

// Route: About Us Page
app.get('/aboutus', (req, res) => {
  res.render('aboutus', { username: null }); // Replace `null` with the username if logged in
});

app.get('/blogdetail', (req, res) => {
  res.render('blogdetail', { username: null }); // Replace `null` with the username if logged in
});

// Route: Products Page
app.get('/products', (req, res) => {
  const query = 'SELECT name, short_description, image FROM products';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve products.');
    }

    res.render('products', { username: null, products: rows }); // Pass the products data to the view
  });
});


app.get('/productdetail', (req, res) => {
  const productName = req.query.name;

  if (!productName) {
    return res.status(400).send('Product name is required.');
  }

  const query = 'SELECT * FROM products WHERE name = ?';
  db.get(query, [productName], (err, product) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve product details.');
    }

    if (!product) {
      return res.status(404).send('Product not found.');
    }

    res.render('productdetail', { username: null, product });
  });
});

// Route: Services Page
app.get('/services', (req, res) => {
  const query = 'SELECT * FROM services';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve services.');
    }
    res.render('services', { username: null, services: rows }); // Pass the services data to the view
  });
});

// Route: Blogs Page
app.get('/blogs', (req, res) => {
  res.render('blogs', { username: null }); // Replace `null` with the username if logged in
});

// Route: Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      res.status(500).json({ message: 'Database error' });
    } else if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
    } else {
      // Compare input password with the stored hash
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.status(500).json({ message: 'Error comparing passwords' });
        } else if (result) {
          res.json({ message: 'Login successful', username: user.username });
        } else {
          res.status(401).json({ message: 'Invalid username or password' });
        }
      });
    }
  });
});

app.get('/productform', (req, res) => {
  const query = 'SELECT name FROM products';
  db.all(query, [], (err, products) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to load products.');
    }
    res.render('productform', { username: null, products });
  });
});

app.post('/submit-product-form', (req, res) => {
  const {
    firstname,
    surname,
    email,
    address,
    phone,
    cake,
    cake_size,
    accompaniment,
    other_request,
    pickup_date,
    send_promotion
  } = req.body;

  // Validate input
  if (!firstname || !surname || !email || !address || !phone || !cake || !cake_size || !pickup_date) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  // Increment sold_quantity for the selected cake
  const updateQuery = 'UPDATE products SET sold_quantity = sold_quantity + 1 WHERE name = ?';
  db.run(updateQuery, [cake], (err) => {
    if (err) {
      console.error('Error updating sold_quantity:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update product quantity.' });
    }

    // Insert order details into product_forms
    const insertQuery = `
      INSERT INTO product_forms (firstname, surname, email, address, phone, cake, cake_size, accompaniment, other_request, pickup_date, send_promotion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(insertQuery, [
      firstname,
      surname,
      email,
      address,
      phone,
      cake,
      cake_size,
      accompaniment,
      other_request || '',
      pickup_date,
      send_promotion ? 1 : 0
    ], function (err) {
      if (err) {
        console.error('Error inserting order:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to save order.' });
      }

      // Success response
      res.json({ success: true, message: 'Order placed successfully!' });
    });
  });
});


app.get('/check-services', (req, res) => {
  const query = 'SELECT * FROM services';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve services.');
    }
    res.json(rows);
  });
});

app.get('/check-users', (req, res) => {
  const query = 'SELECT * FROM users';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve services.');
    }
    res.json(rows);
  });
});

app.get('/check-product-forms', (req, res) => {
  const { searchField, searchValue } = req.query;

  // Base query
  let query = 'SELECT * FROM product_forms';
  const params = [];

  // Add search condition if applicable
  if (searchField && searchValue) {
    query += ` WHERE ${searchField} LIKE ?`;
    params.push(`%${searchValue}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve product forms.');
    }

    res.render('checkproductforms', { productForms: rows });
  });
});


app.get('/check-products', (req, res) => {
  const query = 'SELECT * FROM products';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve products.');
    }
    res.json(rows);
  });
});


app.get('/check-service-forms', (req, res) => {
  const { searchField, searchValue } = req.query;

  // Base query
  let query = 'SELECT * FROM service_forms';
  const params = [];

  // If a search query is provided, add WHERE clause
  if (searchField && searchValue) {
    query += ` WHERE ${searchField} LIKE ?`;
    params.push(`%${searchValue}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Failed to retrieve service forms.');
    }
    res.render('checkserviceforms', { serviceForms: rows });
  });
});

app.get('/serviceform', (req, res) => {
  const serviceType = req.query.serviceType || 'No service selected';
  res.render('serviceform', { serviceType });
});

app.post('/submit-service', (req, res) => {
  const { firstname, surname, email, address, phone, other_request, serviceType } = req.body;

  // Validate input
  if (!firstname || !surname || !email || !address || !phone || !serviceType) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  const query = `
        INSERT INTO service_forms (firstname, surname, email, address, phone, other_request, service_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  db.run(query, [firstname, surname, email, address, phone, other_request, serviceType], function (err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ message: 'Failed to save service inquiry.' });
    }

    // Respond with success message
    res.json({ message: 'Service inquiry submitted successfully!' });
  });
});

app.use((request, response, next) => {
  response.status(404).send(`<h1>404: File not found</h1>`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});