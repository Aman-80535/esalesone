# Firestore Seed Instructions

This project uses Firestore for product storage. The repository includes a helper script to seed example products for categories `men`, `women`, and `latest sale`.

Prerequisites
- Node.js installed (v16+ recommended)
- A Firebase project and a service account JSON key

Steps
1. Install firebase-admin (if not installed):

```bash
npm install firebase-admin
```

2. Generate a service account key JSON in Firebase Console:
   - Go to Project Settings -> Service accounts -> Generate new private key
   - Download the JSON file and keep it safe (don't commit it)

3. Point the script to the service account file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/path/to/service-account.json
```

4. Run the seed script from the repository root:

```bash
node scripts/seedProducts.js
```

What it does
- Adds several sample product documents to the `products` collection with fields:
  - category (string): 'men', 'women', 'latest sale'
  - title, name, description, images (array), price, mrp, rate, stock, discount, count

Notes
- The script uses the Admin SDK and requires the service account JSON.
- If you prefer to seed from client-side code or via the Firestore console, you can copy the sample objects in `scripts/seedProducts.js`.
