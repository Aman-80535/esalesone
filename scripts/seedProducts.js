/**
 * scripts/seedProducts.js
 *
 * Seed the Firestore `products` collection with example documents.
 *
 * Usage:
 * 1) Create a Firebase service account key JSON (Console -> Project Settings -> Service accounts -> Generate new private key)
 * 2) Save the JSON somewhere local, e.g. ~/firebase-service-account.json
 * 3) In your shell: export GOOGLE_APPLICATION_CREDENTIALS=~/firebase-service-account.json
 * 4) npm install firebase-admin
 * 5) node scripts/seedProducts.js
 *
 * The script will add several sample documents to the `products` collection.
 */

const admin = require('firebase-admin');
const serviceAccount = require('../config/saasakitechassignment-firebase-adminsdk-fbsvc-c49f058aeb.json');


async function main() {
  try {
    // Initialize admin SDK using the GOOGLE_APPLICATION_CREDENTIALS env var
  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

    const db = admin.firestore();
    const productsRef = db.collection('products');

const samples = [
  // 👕 MEN
  {
    title: 'Men T-Shirt Basic',
    name: 'Classic Tee',
    description: 'Comfortable cotton t-shirt for daily wear',
    category: 'men',
    count: 10,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
    price: 20,
    mrp: 30,
    rate: 4,
    stock: 15,
    discount: 20
  },
  {
    title: 'Men Slim Fit Jeans',
    name: 'Blue Denim Jeans',
    description: 'Stylish slim fit denim jeans',
    category: 'men',
    count: 12,
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990'],
    price: 45,
    mrp: 65,
    rate: 4,
    stock: 18,
    discount: 30
  },
  {
    title: 'Men Casual Shirt',
    name: 'Cotton Shirt',
    description: 'Comfortable casual cotton shirt',
    category: 'men',
    count: 9,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80'],
    price: 28,
    mrp: 40,
    rate: 4,
    stock: 14,
    discount: 20
  },
  {
    title: 'Men Hoodie Winter',
    name: 'Warm Hoodie',
    description: 'Winter hoodie for cold weather',
    category: 'men',
    count: 8,
    images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7'],
    price: 38,
    mrp: 55,
    rate: 5,
    stock: 10,
    discount: 25
  },

  // 👗 WOMEN
  {
    title: 'Women Summer Dress',
    name: 'Floral Dress',
    description: 'Light summer floral dress',
    category: 'women',
    count: 9,
    images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1'],
    price: 35,
    mrp: 55,
    rate: 5,
    stock: 14,
    discount: 35
  },
  {
    title: 'Women Fashion Top',
    name: 'Crop Top',
    description: 'Trendy crop top for casual wear',
    category: 'women',
    count: 14,
    images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9'],
    price: 18,
    mrp: 28,
    rate: 4,
    stock: 25,
    discount: 20
  },
  {
    title: 'Women Jeans High Waist',
    name: 'High Waist Denim',
    description: 'Comfortable stylish jeans',
    category: 'women',
    count: 11,
    images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b'],
    price: 50,
    mrp: 75,
    rate: 4,
    stock: 16,
    discount: 30
  },
  {
    title: 'Women Skirt Fashion',
    name: 'Mini Skirt',
    description: 'Trendy fashion skirt',
    category: 'women',
    count: 7,
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c'],
    price: 22,
    mrp: 35,
    rate: 4,
    stock: 10,
    discount: 30
  },

  // 🔥 SALE
  {
    title: 'Flash Sale T-Shirt',
    name: 'Graphic Tee Sale',
    description: 'Limited time discount t-shirt',
    category: 'sale',
    count: 25,
    images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519'],
    price: 15,
    mrp: 30,
    rate: 4,
    stock: 40,
    discount: 50
  },
  {
    title: 'Sale Hoodie Offer',
    name: 'Oversized Hoodie',
    description: 'Big discount winter hoodie',
    category: 'sale',
    count: 10,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf'],
    price: 28,
    mrp: 60,
    rate: 5,
    stock: 20,
    discount: 55
  },
  {
    title: 'Sale Sneakers Deal',
    name: 'Casual Sneakers',
    description: 'Discounted stylish sneakers',
    category: 'sale',
    count: 18,
    images: ['https://images.unsplash.com/photo-1520975916090-3105956dac38'],
    price: 40,
    mrp: 80,
    rate: 5,
    stock: 30,
    discount: 50
  },
  {
    title: 'Sale Cap Offer',
    name: 'Street Cap',
    description: 'Trendy cap on sale',
    category: 'sale',
    count: 30,
    images: ['https://images.unsplash.com/photo-1521334884684-d80222895322'],
    price: 10,
    mrp: 25,
    rate: 4,
    stock: 50,
    discount: 60
  },

  // 🧥 GENERAL / LATEST
  {
    title: 'Latest Sneakers',
    name: 'Running Shoes',
    description: 'Comfortable sports sneakers',
    category: 'latest',
    count: 20,
    images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e'],
    price: 60,
    mrp: 90,
    rate: 5,
    stock: 30,
    discount: 35
  },
  {
    title: 'Smart Watch Deal',
    name: 'Fitness Watch',
    description: 'Track your fitness easily',
    category: 'latest',
    count: 8,
    images: ['https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb'],
    price: 75,
    mrp: 120,
    rate: 5,
    stock: 12,
    discount: 40
  }
];

    console.log('Seeding products...');

    for (const p of samples) {
      const docRef = await productsRef.add(p);
      console.log('Added product:', p.title, '->', docRef.id);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error while seeding:', err);
    process.exit(1);
  }
}

main();
