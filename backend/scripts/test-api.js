const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND REST API TESTS ---');
  
  try {
    // 1. Test Welcome Route
    console.log('\n[Test 1] Testing welcome endpoint...');
    const welcome = await request('GET', '/');
    console.log(`Status: ${welcome.statusCode}`);
    console.log(`Body:`, welcome.body);
    if (welcome.statusCode !== 200) throw new Error('Welcome route failed');

    // 2. Test Customer Login
    console.log('\n[Test 2] Testing customer login with seeded credentials...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'customer@clothingstore.com',
      password: 'customer123'
    });
    console.log(`Status: ${loginRes.statusCode}`);
    if (loginRes.statusCode !== 200) throw new Error('Customer login failed');
    console.log('Token successfully generated:', loginRes.body.token ? 'YES' : 'NO');
    const customerToken = loginRes.body.token;

    // 3. Test Admin Login
    console.log('\n[Test 3] Testing admin login with seeded credentials...');
    const adminLoginRes = await request('POST', '/api/auth/admin/login', {
      email: 'admin@clothingstore.com',
      password: 'admin123'
    });
    console.log(`Status: ${adminLoginRes.statusCode}`);
    if (adminLoginRes.statusCode !== 200) throw new Error('Admin login failed');
    console.log('Admin Token generated:', adminLoginRes.body.token ? 'YES' : 'NO');
    const adminToken = adminLoginRes.body.token;

    // 4. Test Get Products
    console.log('\n[Test 4] Testing GET products...');
    const productsRes = await request('GET', '/api/products');
    console.log(`Status: ${productsRes.statusCode}`);
    console.log(`Retrieved ${productsRes.body.length} products.`);
    if (productsRes.statusCode !== 200 || productsRes.body.length === 0) {
      throw new Error('Get products failed');
    }

    // 5. Test Add Product (Admin Required)
    console.log('\n[Test 5] Testing POST product (Admin privileges)...');
    const newProduct = {
      name: 'Test Cotton Tee',
      description: 'Super soft daily tee.',
      price: 24.99,
      discount: 5,
      category: 'Men',
      sizes: ['M', 'L'],
      colors: ['White', 'Navy'],
      stock: 50
    };

    const addProductRes = await request('POST', '/api/products', newProduct, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log(`Status: ${addProductRes.statusCode}`);
    if (addProductRes.statusCode !== 201) throw new Error('Add product failed');
    console.log('Added product:', addProductRes.body.product.name);
    const addedProductId = addProductRes.body.product._id;

    // 6. Test Get Wishlist (Protected)
    console.log('\n[Test 6] Testing GET user wishlist...');
    const wishlistRes = await request('GET', '/api/auth/wishlist', null, {
      'Authorization': `Bearer ${customerToken}`
    });
    console.log(`Status: ${wishlistRes.statusCode}`);
    if (wishlistRes.statusCode !== 200) throw new Error('Get wishlist failed');

    // 7. Test Add to Wishlist
    console.log('\n[Test 7] Testing POST add to user wishlist...');
    const addWishlistRes = await request('POST', '/api/auth/wishlist', { productId: addedProductId }, {
      'Authorization': `Bearer ${customerToken}`
    });
    console.log(`Status: ${addWishlistRes.statusCode}`);
    if (addWishlistRes.statusCode !== 200) throw new Error('Add to wishlist failed');

    // 8. Test Checkout/Create Order
    console.log('\n[Test 8] Testing POST create order...');
    const orderData = {
      items: [
        {
          productId: addedProductId,
          productName: 'Test Cotton Tee',
          quantity: 2,
          size: 'M',
          color: 'White'
        }
      ],
      shippingAddress: {
        fullName: 'Jane Customer',
        mobileNumber: '9999988888',
        email: 'customer@clothingstore.com',
        address: '123 Fashion Street',
        city: 'Metropolis',
        state: 'NY',
        pinCode: '10001'
      },
      paymentMethod: 'Cash on Delivery',
      totalAmount: 47.48 // 24.99 * 0.95 * 2
    };

    const orderRes = await request('POST', '/api/orders', orderData, {
      'Authorization': `Bearer ${customerToken}`
    });
    console.log(`Status: ${orderRes.statusCode}`);
    if (orderRes.statusCode !== 201) throw new Error('Create order failed');
    console.log('Placed Order ID:', orderRes.body.order._id);

    console.log('\n>>> ALL BACKEND TESTS COMPLETED SUCCESSFULLY! <<<');
    process.exit(0);
  } catch (err) {
    console.error('\n>>> TEST RUN FAILED! <<<');
    console.error(err);
    process.exit(1);
  }
}

// Introduce slight delay to allow server to boot up
setTimeout(runTests, 2000);
