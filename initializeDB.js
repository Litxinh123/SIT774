const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db1 = new sqlite3.Database('./site.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database.');

  db1.serialize(() => {
    db1.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error('❌ Error creating users table:', err.message);
      else console.log('✅ Users table created or already exists.');

      const saltRounds = 10;
      const defaultPassword = '123456';

      bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
        if (err) {
          console.error('❌ Error hashing password:', err.message);
          return;
        }
        console.log('✅ Password hashed:', hash);

        console.log('⚡ Running insert user...');
        db1.run(
          `INSERT INTO users (username, password) VALUES (?, ?)`,
          ['lilleetaste', hash],
          function (err) {
            if (err) {
              console.error('❌ Error inserting user:', err.message);
            } else {
              console.log('✅ Default user "lilleetaste" added successfully.');
            }

            db1.get(`SELECT * FROM users WHERE username = ?`, ['lilleetaste'], (err, row) => {
              if (err) {
                console.error('❌ Error querying users table:', err.message);
              } else if (row) {
                console.log('✅ User found in database:', row);
              } else {
                console.log('❌ No user found after insertion!');
              }
              db1.close((err) => {
                if (err) console.error('❌ Error closing database:', err.message);
                else console.log('✅ Database setup complete.');
              });
            });
          }
        );
      });
    });
  });
});


const db = new sqlite3.Database('./site.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database.');

  // Create the users table
  db.serialize(() => {
    // Create service forms table
    db.run(`
      CREATE TABLE IF NOT EXISTS service_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        other_request TEXT,
        service_type TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating services table:', err.message);
      } else {
        console.log('Services table created or already exists.');
      }
    });

    // Create services table
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        selectionType TEXT NOT NULL,
        image TEXT NOT NULL
      )
    `, (err) => {
          if (err) {
            console.error('Error creating services table:', err.message);
          } else {
            console.log('Services table created or already exists.');
    
            // Insert default services with images
            const insertService = db.prepare(`
          INSERT OR IGNORE INTO services (name, description, selectionType, image)
          VALUES (?, ?, ?, ?)
        `);
    
            const services = [
              ['Birthday Celebration', 'A birthday celebration features joy, cake, gifts, and special moments.', 'single', 'https://images.unsplash.com/photo-1530104091755-015d31dfa0b9?q=80&w=2018&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
              ['Wedding Celebration', 'A wedding celebration includes vows, ceremony, and unforgettable memories.', 'single', 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
              ['Business Celebration', 'A business celebration honors achievements and strengthens relationships.', 'group', 'https://plus.unsplash.com/premium_photo-1722859410085-ac4408071ef7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
            ];
    
            services.forEach(service => {
              insertService.run(service, (err) => {
                if (err) {
                  console.error('Error inserting service:', err.message);
                }
              });
            });
    
            insertService.finalize();
          }
        });
    

    // Create products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        image TEXT,
        sold_quantity INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) {
        console.error('Error creating products table:', err.message);
      } else {
        console.log('Products table created or already exists.');

        // Insert default product data
        const insertProduct = db.prepare(`
          INSERT OR IGNORE INTO products (name, description, short_description, image, sold_quantity)
          VALUES (?, ?, ?, ?, ?)
        `);

        const products = [
          [
            'Red Velvet',
            'Red Velvet Cake is a quintessential dessert that dazzles with its vibrant red hue and velvety, moist texture. Originating in the United States, this cake has captured the hearts of dessert lovers around the world. Its luxurious appearance and subtle yet indulgent flavor make it a timeless classic for all types of celebrations, from weddings to birthdays and everything in between. The cake’s signature red color is achieved through the use of food coloring or, in traditional recipes, beetroot juice. This bold visual appeal is complemented by a soft crumb that literally melts in your mouth. Made with a base of cocoa powder, buttermilk, and vinegar, the cake boasts a subtle chocolate flavor balanced by a tangy undertone. The secret to its unique texture lies in the reaction between the acidic and alkaline ingredients, creating a soft, tender structure that stands out from traditional chocolate cakes. Topping this masterpiece is a smooth cream cheese frosting, which brings the perfect balance of sweetness and tang. The frosting enhances every bite, creating a contrast to the mild richness of the cake. Red Velvet Cake is as versatile as it is beautiful. It’s a showstopper at weddings and anniversaries, a sweet indulgence on Valentine’s Day, and a centerpiece for any festive gathering. Whether served as a towering multi-layered cake, as cupcakes, or in trendy cake pops, Red Velvet always impresses. Its rich history dates back to the early 1900s, gaining widespread popularity during the Great Depression. Today, it remains a beloved treat in bakeries and homes alike. This dessert is not just a treat for the palate but also a visual delight, making it a perfect choice for any special occasion.',
            'Rich red chocolate cake',
            'https://plus.unsplash.com/premium_photo-1713920189785-48ef41e01824?q=80&w=1976&auto=format&fit=crop',
             150
          ],
          [
            'Carrot Cake',
            'Carrot Cake is a perfect harmony of flavors and textures, combining the natural sweetness of carrots with a blend of warm spices. Its origins date back to medieval times when carrots were used as a sweetener due to the scarcity of sugar. Over time, it has evolved into one of the most beloved desserts worldwide. The cake’s foundation is grated carrots, which not only provide a delightful texture but also keep the cake exceptionally moist. Warm spices such as cinnamon, nutmeg, and cloves infuse every bite with a cozy, aromatic flavor. Many recipes include nuts like walnuts or pecans, adding a satisfying crunch, while raisins provide a burst of sweetness. A classic cream cheese frosting crowns the cake, offering a tangy complement to its earthy and spiced notes. The versatility of Carrot Cake makes it a staple at various celebrations, from Easter brunches to casual tea parties. Its rich, wholesome ingredients appeal to a wide range of tastes and dietary preferences, with modern variations like vegan or gluten-free options ensuring inclusivity. Whether served as a loaf, a layer cake, or bite-sized cupcakes, Carrot Cake remains a comforting and timeless dessert loved by all.',
            'Spiced carrot dessert',
            'https://plus.unsplash.com/premium_photo-1714669899908-4b151851ee2a?q=80&w=1976&auto=format&fit=crop',
             200
          ],
          [
            'Tiramisu Cake',
            'Tiramisu Cake is an elegant Italian creation that combines the indulgent flavors of espresso, mascarpone cheese, and cocoa. Its name, “Tiramisu,” translates to “pick me up,” reflecting the energizing combination of coffee and rich cream. This dessert is a modern take on the traditional Tiramisu, using layers of sponge cake soaked in espresso rather than the classic ladyfingers. Each layer is interspersed with a luxurious mascarpone filling, creating a creamy texture that melts in your mouth. A dusting of cocoa powder atop the cake adds a touch of bitterness, perfectly balancing the sweetness of the mascarpone and the slight acidity of the coffee. Served chilled, Tiramisu Cake is the perfect dessert for warm evenings or a sophisticated end to a meal. Its origins trace back to Veneto, Italy, where it became a beloved treat for gatherings. Today, it’s enjoyed worldwide, often adapted with modern twists like chocolate shavings or liqueur-infused layers. Tiramisu Cake embodies simplicity and sophistication, making it a favorite for everything from dinner parties to intimate celebrations.',
            'Coffee-flavored Italian dessert',
            'https://images.unsplash.com/photo-1702744998351-090b3ee4e976?q=80&w=1974&auto=format&fit=crop',
            180
          ],
          [
            'Potato Cake',
            'Potato Cake is a savory masterpiece that highlights the versatility of potatoes. Made from mashed potatoes, this dish is often enhanced with a mix of herbs, spices, and cheese. The exterior is crispy and golden, achieved by pan-frying or baking, while the interior remains soft and creamy. Potato Cake can be adapted with various ingredients, such as bacon bits, onions, or vegetables, making it a customizable favorite. Its simplicity and hearty flavor make it a perfect accompaniment to soups, salads, or roasted meats. For those seeking comfort food with a twist, Potato Cake is an excellent choice. Whether served as a side dish, a snack, or even a main course, this savory delight is a crowd-pleaser at any table.',
            'Savory mashed potato cake',
            'https://images.unsplash.com/photo-1551879400-111a9087cd86?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            100
          ],
          [
            'Caramel Cake',
            'Caramel Cake is a rich and indulgent dessert that celebrates the deep, golden flavors of caramel. Its soft, buttery layers are infused with caramel syrup, creating a warm and inviting sweetness. The highlight is its luscious caramel frosting, often made from scratch by caramelizing sugar and blending it with cream and butter. This frosting is generously spread over the cake, adding depth and richness to every bite. Caramel Cake’s luxurious flavor profile and elegant appearance make it a perfect centerpiece for celebrations. Whether it’s served at a birthday party or enjoyed with a cup of coffee, this cake offers an experience of pure indulgence.',
            'Rich caramel dessert',
            'https://plus.unsplash.com/premium_photo-1664205765793-9364f5d2214d?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            170
          ],
          [
            'Matcha Cake',
            'Matcha Cake is a modern twist on a traditional Japanese flavor, blending the earthy taste of matcha green tea with the light and fluffy texture of a sponge cake. The cake’s vibrant green color comes from high-quality matcha powder, which also lends a slightly bitter undertone. This bitterness is balanced by the sweetness of the cake and is often paired with whipped cream or white chocolate frosting. Matcha Cake is not only visually stunning but also offers health benefits, such as antioxidants and a gentle caffeine boost. Perfect for tea parties, birthdays, or as a unique dessert, Matcha Cake is a harmonious blend of tradition and modern indulgence.',
            'Matcha green tea dessert',
            'https://images.unsplash.com/photo-1627308592778-290a1ec030da?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            120
          ]
        ];


        products.forEach(product => {
          insertProduct.run(product, (err) => {
            if (err) {
              console.error('Error inserting product:', err.message);
            }
          });
        });

        insertProduct.finalize();
      }
    });

    // Create product forms table
    db.run(`
      CREATE TABLE IF NOT EXISTS product_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        cake TEXT NOT NULL,
        cake_size TEXT NOT NULL,
        accompaniment TEXT NOT NULL,
        other_request TEXT,
        pickup_date TEXT NOT NULL,
        send_promotion BOOLEAN DEFAULT false
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating product_forms table:', err.message);
      } else {
        console.log('✅ Product forms table created or already exists.');
      }
    });

    // ✅ Close database only after all operations are completed
    db.serialize(() => {
      db.get(`SELECT * FROM users WHERE username = ?`, ['lilleetaste'], (err, row) => {
        if (err) {
          console.error('❌ Error querying users table:', err.message);
        } else if (row) {
          console.log('✅ User found in database:', row);
        } else {
          console.log('❌ No user found after insertion!');
        }

        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('✅ Database setup complete.');
          }
        });
      });
    });

  }); // End db.serialize()

  
});