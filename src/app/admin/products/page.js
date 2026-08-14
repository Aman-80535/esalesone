'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/redux/user/userActions';
import { createAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/redux/product/productAction';
import { formatCurrency, simpleNotify } from '@/utils/common';
import Loader from '@/app/components/common/Loader';

const INITIAL_FORM = {
  name: '',
  title: '',
  description: '',
  category: 'men',
  price: '',
  mrp: '',
  stock: 10,
  discount: 0,
  rate: 4.5,
  images: '',
  manufacturer: 'Shopi Brand',
};

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  const { products = [], loading } = useSelector((s) => s.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      title: product.title || '',
      description: product.description || '',
      category: String(product.category?.name ?? product.category ?? 'men').toLowerCase(),
      price: product.price || '',
      mrp: product.mrp || '',
      stock: product.stock ?? 10,
      discount: product.discount || 0,
      rate: product.rate || 4.5,
      images: Array.isArray(product.images) ? product.images.join(', ') : (product.image || ''),
      manufacturer: product.manufacturer || 'Shopi Brand',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageArray = formData.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        title: formData.title.trim() || formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.toLowerCase().trim(),
        price: Number(formData.price),
        mrp: Number(formData.mrp || formData.price),
        stock: Number(formData.stock),
        discount: Number(formData.discount || 0),
        rate: Number(formData.rate || 4.5),
        images: imageArray.length > 0 ? imageArray : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
        manufacturer: formData.manufacturer || 'Shopi Brand',
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
      } else {
        await createAdminProduct(payload);
      }

      await dispatch(fetchProducts());
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteAdminProduct(id);
      dispatch(fetchProducts());
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const itemCat = String(p.category?.name ?? p.category ?? '').toLowerCase();
    const matchesCat = selectedCategory === 'all' || itemCat.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Product Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total Inventory: {products.length} Products
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card !p-4 !mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <input
          type="text"
          className="admin-form-input !max-w-md"
          placeholder="Search products by title or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Category:
          </label>
          <select
            className="admin-form-select !w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="latest">Latest</option>
            <option value="sale">Sale</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        {loading && !products.length ? (
          <Loader text="Loading product inventory..." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price / MRP</th>
                  <th>Stock</th>
                  <th>Discount</th>
                  <th>Rating</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={product?.images?.[0] || product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">
                              {product.name || product.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[240px]">
                              {product.description || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="capitalize px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md text-xs font-semibold">
                          {String(product.category?.name ?? product.category ?? '-')}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                          {product.mrp && (
                            <span className="text-xs text-gray-400 line-through ml-2">
                              {formatCurrency(product.mrp)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`font-semibold ${
                            (product.stock ?? 1) <= 5 ? 'text-red-600' : 'text-gray-800'
                          }`}
                        >
                          {product.stock ?? 10} units
                        </span>
                      </td>
                      <td>
                        {product.discount ? (
                          <span className="text-xs font-bold text-amber-600">
                            {product.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm font-semibold">⭐ {product.rate || 4.5}</span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-admin-sm"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-admin-sm btn-admin-danger"
                          onClick={() => handleDelete(product.id, product.name || product.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g. Classic Cotton Tee"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Short Title / Subtitle</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Men Slim Fit"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Description *</label>
                <textarea
                  rows="3"
                  required
                  className="admin-form-textarea"
                  placeholder="Detailed product features, materials, and care instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    className="admin-form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="latest">Latest</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Manufacturer / Brand</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Shopi Essentials"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="admin-form-input"
                    placeholder="299.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>MRP / Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    placeholder="499.00"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    className="admin-form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="admin-form-input"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Image URLs (Comma-separated)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="https://images.unsplash.com/..., https://..."
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste one or more image links separated by commas.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="btn-admin-sm !py-2 !px-4"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-admin-primary"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
