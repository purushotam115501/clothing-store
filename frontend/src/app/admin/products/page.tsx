'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  rating: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { loading: authLoading, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form toggle states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [category, setCategory] = useState('Men');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState('');
  const [stock, setStock] = useState('10');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFilesBase64, setImageFilesBase64] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch admin products catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
      } else {
        fetchProducts();
      }
    }
  }, [authLoading, isAdmin]);

  const openAddForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscount('0');
    setCategory('Men');
    setSizes(['M']);
    setColors('Black, White');
    setStock('20');
    setImagePreviews([]);
    setImageFilesBase64([]);
    setErrorMsg('');
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setDiscount(product.discount.toString());
    setCategory(product.category);
    setSizes(product.sizes);
    setColors(product.colors.join(', '));
    setStock(product.stock.toString());
    setImagePreviews(product.images);
    setImageFilesBase64([]); // Existing image urls are kept unless overwritten
    setErrorMsg('');
    setFormOpen(true);
  };

  // Convert uploaded files to base64 for display previews and transmission
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreviews((prev) => [...prev, base64String]);
        setImageFilesBase64((prev) => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImagePreview = (index: number, previewUrl: string) => {
    setImagePreviews(prev => prev.filter((_, idx) => idx !== index));
    // If it was a newly uploaded base64 file, remove it from base64 list too
    if (previewUrl.startsWith('data:image')) {
      setImageFilesBase64(prev => prev.filter(base64 => base64 !== previewUrl));
    }
  };

  const toggleSizeCheckbox = (sizeVal: string) => {
    setSizes(prev => 
      prev.includes(sizeVal) ? prev.filter(s => s !== sizeVal) : [...prev, sizeVal]
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (sizes.length === 0) {
      setErrorMsg('Please select at least one size.');
      return;
    }
    setSubmitting(true);

    try {
      const productPayload = {
        name,
        description,
        price: Number(price),
        discount: Number(discount),
        category,
        sizes,
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
        stock: Number(stock),
        images: imagePreviews // Send previews. Base64 triggers uploads, existing URL maps keep standard URL references.
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productPayload);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', productPayload);
        alert('Product created successfully!');
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit product data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/products/${productId}`);
      alert('Product deleted successfully.');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  const categoriesOptions = ['Men', 'Women', 'Kids', 'New Arrival', 'Sale'];
  const sizesOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  if (authLoading || !isAdmin) {
    return <div className="p-12 text-center text-xs">Authenticating privileges...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 text-foreground">
      
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-wide uppercase">Product Catalog Management</h1>
          <p className="text-xs text-muted-foreground">Manage inventories, modify prices, and upload apparel images.</p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded bg-primary px-5 py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors flex items-center space-x-1.5 focus:outline-none"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* MODAL FORM SHEET */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
              
              {/* Product name & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="product-name-input" className="block font-semibold text-muted-foreground uppercase mb-1">Product Name</label>
                  <input
                    id="product-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Classic Trench Coat"
                    className="w-full rounded border border-border bg-transparent p-2.5 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="product-desc-textarea" className="block font-semibold text-muted-foreground uppercase mb-1">Description</label>
                  <textarea
                    id="product-desc-textarea"
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about fit, fabric blend, care guidelines, etc."
                    className="w-full rounded border border-border bg-transparent p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price, Discount, Category, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="product-price-input" className="block font-semibold text-muted-foreground uppercase mb-1">Price ($)</label>
                  <input
                    id="product-price-input"
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded border border-border bg-transparent p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="product-discount-input" className="block font-semibold text-muted-foreground uppercase mb-1">Discount (%)</label>
                  <input
                    id="product-discount-input"
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full rounded border border-border bg-transparent p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="product-category-select" className="block font-semibold text-muted-foreground uppercase mb-1">Category</label>
                  <select
                    id="product-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-border bg-card p-2.5 focus:outline-none cursor-pointer"
                  >
                    {categoriesOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="product-stock-input" className="block font-semibold text-muted-foreground uppercase mb-1">Stock</label>
                  <input
                    id="product-stock-input"
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded border border-border bg-transparent p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sizes checklist */}
              <div className="space-y-2">
                <span className="block font-semibold text-muted-foreground uppercase">Available Sizes</span>
                <div className="flex flex-wrap gap-3">
                  {sizesOptions.map(sz => (
                    <label key={sz} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sizes.includes(sz)}
                        onChange={() => toggleSizeCheckbox(sz)}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="font-semibold">{sz}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors comma list */}
              <div>
                <label htmlFor="product-colors-input" className="block font-semibold text-muted-foreground uppercase mb-1">Colors (Comma separated)</label>
                <input
                  id="product-colors-input"
                  type="text"
                  required
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="e.g. Navy Blue, White, Crimson Red"
                  className="w-full rounded border border-border bg-transparent p-2.5 focus:outline-none"
                />
              </div>

              {/* IMAGE UPLOAD PREVIEW SYSTEM */}
              <div className="space-y-3">
                <span className="block font-semibold text-muted-foreground uppercase">Product Gallery Images</span>
                <div className="flex flex-wrap gap-3">
                  {/* previews cards */}
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 aspect-[3/4] rounded border border-border overflow-hidden bg-muted flex-shrink-0">
                      <img src={preview} alt="" className="h-full w-full object-cover object-center" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImagePreview(i, preview)}
                        className="absolute right-1 top-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload box wrapper */}
                  <label className="w-20 aspect-[3/4] rounded border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-all bg-muted/20">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[8px] text-muted-foreground font-bold uppercase mt-1">Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {errorMsg && <p className="text-red-500 font-semibold">{errorMsg}</p>}

              <div className="flex space-x-3 justify-end border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded border border-border px-6 py-2.5 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-primary px-6 py-2.5 font-bold text-primary-foreground uppercase tracking-wider hover:bg-neutral-900 transition-colors flex items-center space-x-1"
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{submitting ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRODUCTS TABULAR LISTING */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-wider">Catalog Inventory</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs animate-pulse">Loading Inventory grid...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">No garments recorded in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4 text-[10px]">Image</th>
                  <th className="p-4 text-[10px]">Name</th>
                  <th className="p-4 text-[10px]">Category</th>
                  <th className="p-4 text-[10px]">Price</th>
                  <th className="p-4 text-[10px]">Stock</th>
                  <th className="p-4 text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'}
                        alt=""
                        className="h-10 w-7.5 object-cover object-center rounded border border-border bg-muted"
                      />
                    </td>
                    <td className="p-4 font-semibold">{p.name}</td>
                    <td className="p-4 font-semibold uppercase text-[10px] text-muted-foreground">{p.category}</td>
                    <td className="p-4 font-semibold">${p.price.toFixed(2)}</td>
                    <td className="p-4 font-semibold">
                      {p.stock === 0 ? (
                        <span className="text-red-500 font-bold uppercase text-[10px]">Sold Out</span>
                      ) : p.stock < 5 ? (
                        <span className="text-yellow-600 font-bold uppercase text-[10px]">Low ({p.stock})</span>
                      ) : (
                        <span className="text-green-600 font-semibold">{p.stock}</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditForm(p)}
                        className="inline-flex items-center space-x-1 font-bold text-blue-500 hover:underline mr-3"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="inline-flex items-center space-x-1 font-bold text-red-500 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
