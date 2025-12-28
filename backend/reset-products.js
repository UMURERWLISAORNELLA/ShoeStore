const db = require('./config/database');
const fs = require('fs');
const path = require('path');

const resetProducts = async () => {
  try {
    console.log('Resetting products...');
    
    // Clear all products
    await db.query('DELETE FROM products');
    console.log('Cleared existing products');
    
    // Insert new products with proper images
    const seedSQL = fs.readFileSync(path.join(__dirname, 'config/seed-data.sql'), 'utf8');
    
    // Extract only the products INSERT statement
    const productInsert = seedSQL.split('INSERT INTO products')[1].split('ON CONFLICT')[0];
    const fullQuery = 'INSERT INTO products' + productInsert + 'ON CONFLICT (name) DO NOTHING;';
    
    await db.query(fullQuery);
    console.log('Inserted new products with updated images');
    
    // Verify products
    const result = await db.query('SELECT name, image_url FROM products');
    console.log('Current products:');
    result.rows.forEach(product => {
      console.log(`- ${product.name}: ${product.image_url}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting products:', error);
    process.exit(1);
  }
};

resetProducts();