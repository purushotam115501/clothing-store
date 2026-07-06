require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static uploads folder (for simulated Cloudinary image storage)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Default welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Clothing Store API is running.' });
});

// Seed data function to populate catalog and default admin account
async function seedDatabase() {
  try {
    // 1. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Seeder] Seeding initial sample products...');
      const sampleProducts = [
        {
          name: 'Premium Slim Fit Leather Jacket',
          description: 'A premium-grade, hand-tailored leather jacket featuring heavy-duty zip closures and a quilted inner lining. Perfect for autumn and winter layering.',
          price: 189.99,
          discount: 15,
          category: 'Men',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'Dark Brown'],
          stock: 12,
          images: [
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.8,
          reviews: [
            { userId: 'seed_u1', userName: 'John Doe', rating: 5, comment: 'Absolutely incredible quality. Feels heavy and premium.' },
            { userId: 'seed_u2', userName: 'Marcus K.', rating: 4, comment: 'Slightly tight in the shoulders but beautiful leather.' }
          ]
        },
        {
          name: 'Classic Linen Summer Dress',
          description: 'Breathable, lightweight 100% pure organic linen dress with a side slit and functional front buttons. Ideal for warm sunny days and resort wear.',
          price: 79.99,
          discount: 0,
          category: 'Women',
          sizes: ['XS', 'S', 'M', 'L'],
          colors: ['Beige', 'White', 'Sage Green'],
          stock: 25,
          images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.5,
          reviews: [
            { userId: 'seed_u3', userName: 'Jane Smith', rating: 5, comment: 'Very soft linen. Keeps me cool and looks elegant.' }
          ]
        },
        {
          name: 'Streetwear Graphic Hoodie',
          description: 'Heavyweight loopback cotton hood with custom modern artwork print, kangaroo pouch pocket, and double-layered hood. Relaxed streetwear fit.',
          price: 64.99,
          discount: 20,
          category: 'New Arrival',
          sizes: ['M', 'L', 'XL', 'XXL'],
          colors: ['Off-White', 'Acid Wash Black'],
          stock: 18,
          images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.6,
          reviews: []
        },
        {
          name: 'Kids Comfort Sweat Set',
          description: 'Cozy two-piece set containing crewneck pullover and jogger pants made from organic cotton fleece. Gentle on child skin and machine-wash friendly.',
          price: 39.99,
          discount: 10,
          category: 'Kids',
          sizes: ['Free Size'],
          colors: ['Soft Pink', 'Mustard', 'Navy Blue'],
          stock: 30,
          images: [
            'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.9,
          reviews: [
            { userId: 'seed_u4', userName: 'Emily R.', rating: 5, comment: 'My son loves this set. Extremely comfortable!' }
          ]
        },
        {
          name: 'Tailored Wool Blend Blazer',
          description: 'Sharp double-breasted structured blazer crafted from structured wool fabric. Features peak lapels and structural padded shoulders.',
          price: 149.99,
          discount: 30,
          category: 'Sale',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Navy Pinstripe', 'Charcoal Gray'],
          stock: 8,
          images: [
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.7,
          reviews: []
        },
        {
          name: 'Flowing Satin Skirt',
          description: 'A midi-length bias cut skirt made from luxurious lustrous satin with a concealed elastic waistband. Pairs perfectly with knits or blouses.',
          price: 54.99,
          discount: 0,
          category: 'Women',
          sizes: ['S', 'M', 'L'],
          colors: ['Champagne Gold', 'Emerald Green', 'Black'],
          stock: 15,
          images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.3,
          reviews: []
        },
        {
          name: 'Vintage Check flannel Shirt',
          description: 'A heavy brushed cotton flannel button-up. Designed with classic double flap pockets and a relaxed straight hem.',
          price: 49.99,
          discount: 10,
          category: 'Men',
          sizes: ['M', 'L', 'XL'],
          colors: ['Red Check', 'Forest Green Check'],
          stock: 20,
          images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
          ],
          rating: 4.4,
          reviews: []
        }
      ];

      for (const p of sampleProducts) {
        await Product.create(p);
      }
      console.log('[Seeder] Sample products loaded successfully.');
    }

    // 2. Seed Admin User if not exist
    const adminUser = await User.findOne({ email: 'admin@clothingstore.com' });
    if (!adminUser) {
      console.log('[Seeder] Creating default Admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'System Admin',
        email: 'admin@clothingstore.com',
        password: hashedPassword,
        role: 'admin',
        wishlist: []
      });
      console.log('[Seeder] Default Admin account created:');
      console.log('         Email: admin@clothingstore.com');
      console.log('         Password: admin123');
    }

    // 3. Seed Default Customer User if not exist
    const customerUser = await User.findOne({ email: 'customer@clothingstore.com' });
    if (!customerUser) {
      console.log('[Seeder] Creating default Customer user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('customer123', salt);

      await User.create({
        name: 'John Customer',
        email: 'customer@clothingstore.com',
        password: hashedPassword,
        role: 'customer',
        wishlist: []
      });
      console.log('[Seeder] Default Customer account created:');
      console.log('         Email: customer@clothingstore.com');
      console.log('         Password: customer123');
    }
  } catch (err) {
    console.error('[Seeder] Seeding database failed:', err);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`[Server] Express API listening on port ${PORT}`);
  // Run seeder
  await seedDatabase();
});
