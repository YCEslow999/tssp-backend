import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';




import products from './models/products.js';
import * as dotenv from 'dotenv';
import CloudinaryStorage from 'multer-storage-cloudinary';
import categories from './models/categories.js';
import brands from './models/brands.js';




dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

//app.use(express.static(path.join(__dirname, '../frontend/build')));



// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tattoo-supply-admin/products',
    format: async (req, file) => 'jpg',
    public_id: () => Date.now(),
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo immagini sono consentite'));
    }
  }
});






// Connessione al database
mongoose.connect(
  process.env.MONGO_URI
)
.then (() => {

    console.log("MongoDB connesso");
    app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
})

})
.catch(err => console.log("Connessione a MongoDB fallita", err));







//PAGINA INCHIOSTRO
app.get("/api/products/ink_products", async (req, res) => {
   try {
    const inkProducts = await products.find({category: "Inchiostro"});
    res.json(inkProducts);
   } catch(err) {
    res.status(500).json({error: "Errore nel recupero dei dati"});
   }
   
});


//PAGINA MACCHINETTE
app.get("/api/products/machine_products", async (req, res) => {
   try {
    const machineProducts = await products.find({category: "Macchinette"});
    res.json(machineProducts);
   } catch(err) {
    res.status(500).json({error: "Errore nel recupero dei dati"});
   }
   
});

//GET ALL PRODUCTS (per il carrello)
app.get("/api/products/all", async (req, res) => {
   try {
    const allProducts = await products.find({});
    res.json(allProducts);
   } catch(err) {
    res.status(500).json({error: "Errore nel recupero dei dati"});
   }
});



//GET ALL CATEGORIES
app.get("/api/categories", async(req,res) => {
  try {
    const allCategories = await(categories.find({}));
    res.json(allCategories);
  } catch(err) {
    res.status(500).json({error: "Errore nel recupero dei dati"});
  }
});


//GET ALL BRANDS
app.get("/api/brands", async(req,res) => {
  try {
    const allBrands = await(brands.find({}));
    res.json(allBrands);
  } catch(err) {
    res.status(500).json({error: "Errore nel recupero dei brand"});
  }
});


//========== ADMIN PANEL CRUD ENDPOINTS ==========

// UPLOAD IMMAGINE
app.post("/api/admin/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nessun file fornito" });
    }
    

    // Cloudinary returns the secure_url
    const cloudinaryUrl = req.file.path;
    res.json({ filePath: cloudinaryUrl });
  } catch (err) {
    res.status(500).json({ error: "Errore nel caricamento dell'immagine" });
  }
});

// GET ALL PRODUCTS FOR ADMIN PANEL
app.get("/api/admin/products", async (req, res) => {
   try {
    const allProducts = await products.find({});
    res.json(allProducts);
   } catch(err) {
    res.status(500).json({error: "Errore nel recupero dei prodotti"});
   }
});

// GET SINGLE PRODUCT
app.get("/api/admin/products/:id", async (req, res) => {
   try {
    const product = await products.findById(req.params.id);
    if(!product) {
      return res.status(404).json({error: "Prodotto non trovato"});
    }
    res.json(product);
   } catch(err) {
    res.status(500).json({error: "Errore nel recupero del prodotto"});
   }
});

// CREATE PRODUCT
app.post("/api/admin/products", async (req, res) => {
   try {
    const { name, category, brand, price, stock, image_url, image, variants, is_active } = req.body;
    
    if(!name || !category || !price) {
      return res.status(400).json({error: "Campi obbligatori mancanti"});
    }

    const newProduct = new products({
      name,
      category,
      brand: brand || "",
      price: parseFloat(price),
      stock: stock || 0,
      image_url: image_url || "",
      image: image || "",
      variants: variants || [],
      is_active: is_active !== undefined ? is_active : true
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
   } catch(err) {
    res.status(500).json({error: "Errore nella creazione del prodotto"});
   }
});

// UPDATE PRODUCT
app.put("/api/admin/products/:id", async (req, res) => {
   try {
    const { name, category, brand, price, stock, image_url, variants, is_active } = req.body;
    
    const updatedProduct = await products.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        brand,
        price: parseFloat(price),
        stock,
        image_url,
        variants: variants || [],
        is_active
      },
      { new: true }
    );

    if(!updatedProduct) {
      return res.status(404).json({error: "Prodotto non trovato"});
    }

    res.json(updatedProduct);
   } catch(err) {
    res.status(500).json({error: "Errore nell'aggiornamento del prodotto"});
   }
});

// DELETE PRODUCT
app.delete("/api/admin/products/:id", async (req, res) => {
   try {
    const deletedProduct = await products.findByIdAndDelete(req.params.id);
    
    if(!deletedProduct) {
      return res.status(404).json({error: "Prodotto non trovato"});
    }

    res.json({message: "Prodotto eliminato con successo"});
   } catch(err) {
    res.status(500).json({error: "Errore nell'eliminazione del prodotto"});
   }
});

//CREATE CATEGORY
app.post("/api/admin/categories", async (req, res) => {
  try {
    const { name } = req.body;

    const newCategory = new categories({ name });
    const savedCategory = await newCategory.save();

    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//DELETE CATEGORY
app.delete("/api/admin/categories/:id", async (req, res) => {
  await categories.findByIdAndDelete(req.params.id);
  
  res.json({success:true});
})


//CREATE BRAND
app.post("/api/admin/brands", async (req, res) => {
  try {
    const { name, image_url, category } = req.body;

    const newBrand = new brands({ name, image_url: image_url || '', category: category || '' });
    const savedBrand = await newBrand.save();

    res.status(201).json(savedBrand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//DELETE BRAND
app.delete("/api/admin/brands/:id", async (req, res) => {
  await brands.findByIdAndDelete(req.params.id);
  
  res.json({success:true});
})
