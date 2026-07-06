const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Get All Products (with Search, Filters & Sorting)
exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, size, color, sort } = req.query;

    const query = {};

    // 1. Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // 2. Category filter
    if (category) {
      query.category = category;
    }

    // 3. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 4. Size filter
    if (size) {
      query.sizes = size;
    }

    // 5. Color filter
    if (color) {
      query.colors = color;
    }

    // Fetch products
    let dbQuery = Product.find(query);

    // 6. Sorting
    if (sort) {
      if (sort === 'priceAsc') {
        dbQuery.sort({ price: 1 });
      } else if (sort === 'priceDesc') {
        dbQuery.sort({ price: -1 });
      } else if (sort === 'newest') {
        dbQuery.sort({ createdAt: -1 });
      } else if (sort === 'bestSelling') {
        // Mocking bestselling sort (we can sort by rating or order count, sorting by rating here)
        dbQuery.sort({ rating: -1 });
      }
    } else {
      // Default to newest
      dbQuery.sort({ createdAt: -1 });
    }

    const products = await dbQuery;
    res.status(200).json(products);
  } catch (err) {
    console.error('[Get Products Error]', err);
    res.status(500).json({ message: 'Server error retrieving products.' });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error('[Get Product By ID Error]', err);
    res.status(500).json({ message: 'Server error retrieving product.' });
  }
};

// Add Product (Admin Only)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discount, category, sizes, colors, stock } = req.body;
    
    // Process image uploads. We expect files to be passed or base64 list
    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      // Multer file upload
      for (const file of req.files) {
        let uploadSource;
        if (file.buffer) {
          uploadSource = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        } else {
          uploadSource = file.path;
        }
        const result = await cloudinary.uploader.upload(uploadSource);
        imageUrls.push(result.secure_url);
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      // Direct base64 image strings
      for (const base64Str of req.body.images) {
        const result = await cloudinary.uploader.upload(base64Str);
        imageUrls.push(result.secure_url);
      }
    }

    // Default placeholder image if none uploaded
    if (imageUrls.length === 0) {
      imageUrls.push('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80');
    }

    const parsedSizes = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',') : []);
    const parsedColors = Array.isArray(colors) ? colors : (colors ? colors.split(',') : []);

    const newProduct = await Product.create({
      name,
      description,
      price: Number(price),
      discount: Number(discount || 0),
      category,
      sizes: parsedSizes,
      colors: parsedColors,
      stock: Number(stock || 0),
      images: imageUrls,
      reviews: [],
      rating: 0
    });

    res.status(201).json({ message: 'Product created successfully.', product: newProduct });
  } catch (err) {
    console.error('[Add Product Error]', err);
    res.status(500).json({ message: 'Server error creating product.' });
  }
};

// Edit Product (Admin Only)
exports.editProduct = async (req, res) => {
  try {
    const { name, description, price, discount, category, sizes, colors, stock, images } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Parse sizes/colors
    if (sizes) product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',');
    if (colors) product.colors = Array.isArray(colors) ? colors : colors.split(',');
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);

    // Process new image uploads if any
    let imageUrls = [...(product.images || [])];

    if (req.files && req.files.length > 0) {
      // Reset images if new ones are uploaded via form-data
      imageUrls = [];
      for (const file of req.files) {
        let uploadSource;
        if (file.buffer) {
          uploadSource = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        } else {
          uploadSource = file.path;
        }
        const result = await cloudinary.uploader.upload(uploadSource);
        imageUrls.push(result.secure_url);
      }
    } else if (images && Array.isArray(images)) {
      // Overwrite images if passed in JSON body (e.g. edited image urls list or base64)
      imageUrls = [];
      for (const img of images) {
        if (img.startsWith('data:image')) {
          const result = await cloudinary.uploader.upload(img);
          imageUrls.push(result.secure_url);
        } else {
          imageUrls.push(img);
        }
      }
    }

    product.images = imageUrls;
    product.updatedAt = new Date().toISOString();
    await product.save();

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (err) {
    console.error('[Edit Product Error]', err);
    res.status(500).json({ message: 'Server error updating product.' });
  }
};

// Delete Product (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Attempt to delete images in Cloudinary / Local storage
    for (const imgUrl of (product.images || [])) {
      if (imgUrl.includes('/uploads/')) {
        // Extract public_id / file name from URL for mock
        const parts = imgUrl.split('/');
        const fileName = parts[parts.length - 1];
        await cloudinary.uploader.destroy(fileName);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('[Delete Product Error]', err);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
};

// Add Product Review
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => String(r.userId) === String(req.user.id)
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by you.' });
    }

    const review = {
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    product.reviews.push(review);
    
    // Calculate average rating
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully.', product });
  } catch (err) {
    console.error('[Add Review Error]', err);
    res.status(500).json({ message: 'Server error adding review.' });
  }
};
