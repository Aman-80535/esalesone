'use client';

import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchProducts } from '@/redux/user/userActions';
import ProductCard from '@/app/components/ProductCard';
import Loader from '@/app/components/common/Loader';
import BackButton from '@/app/components/BackBUtton';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const dispatch = useDispatch();
  const router = useRouter();
  const { products = [], loading } = useSelector((s) => s.user);

  const [inputVal, setInputVal] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  useEffect(() => {
    if (!products.length) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  let results = products.filter((item) => {
    const q = (query || inputVal).toLowerCase().trim();
    const matchesQuery =
      !q ||
      (item?.title || '').toLowerCase().includes(q) ||
      (item?.name || '').toLowerCase().includes(q) ||
      String(item?.category?.name ?? item?.category ?? '').toLowerCase().includes(q) ||
      (item?.description || '').toLowerCase().includes(q);

    const itemCat = String(item?.category?.name ?? item?.category ?? '').toLowerCase();
    const matchesCat = selectedCategory === 'all' || itemCat.includes(selectedCategory);
    const matchesStock = !inStockOnly || Number(item?.stock ?? 1) > 0;

    return matchesQuery && matchesCat && matchesStock;
  });

  if (sortBy === 'price-asc') {
    results = [...results].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortBy === 'price-desc') {
    results = [...results].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (sortBy === 'rating') {
    results = [...results].sort((a, b) => (Number(b.rate) || 0) - (Number(a.rate) || 0));
  } else if (sortBy === 'discount') {
    results = [...results].sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
  }

  const popularKeywords = ['T-Shirt', 'Jeans', 'Hoodie', 'Dress', 'Sneakers', 'Watch', 'Crop Top'];

  return (
    <div className="bg-[#f2f7f5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton onClick={() => router.push('/')} />
          <nav className="text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-emerald-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-bold">Search Catalog</span>
          </nav>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="pb-6 border-b">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950">
              {query ? `Results for "${query}"` : 'Product Search'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Found {results.length} matching items in inventory
            </p>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 my-6 max-w-2xl">
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-emerald-800 outline-none"
              placeholder="Search by keywords, categories, or styles..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
            >
              Search
            </button>
          </form>

          {/* Popular Search Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-gray-500 mr-1">Trending Searches:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-900 rounded-full text-xs font-semibold transition"
                onClick={() => {
                  setInputVal(kw);
                  router.push(`/search?q=${encodeURIComponent(kw)}`);
                }}
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Category:</span>
              <select
                className="rounded-xl px-3 py-2 border border-gray-200 bg-white text-xs font-medium"
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

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                In-Stock Only
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Sort:</span>
                <select
                  className="rounded-xl px-3 py-2 border border-gray-200 bg-white text-xs font-medium"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated ⭐</option>
                  <option value="discount">Biggest Discount %</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="mt-8">
            {loading && !products.length ? (
              <Loader text="Searching product catalog..." />
            ) : results.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-gray-800">No items matched your search</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Try checking for spelling errors or searching for broader terms like &quot;shirts&quot; or &quot;jeans&quot;.
                </p>
                <button
                  type="button"
                  className="mt-4 px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700"
                  onClick={() => {
                    setInputVal('');
                    setSelectedCategory('all');
                    router.push('/');
                  }}
                >
                  Browse Full Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader text="Searching catalog..." />}>
      <SearchContent />
    </Suspense>
  );
}
