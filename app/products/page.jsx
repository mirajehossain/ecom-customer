'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { productsAPI, categoriesAPI } from '@/lib/api';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(() => searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('max_price') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  // Update state when URL parameters change (e.g., clicking categories from menu)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    const searchFromUrl = searchParams.get('search') || '';
    const sortFromUrl = searchParams.get('sort') || '';
    const minPriceFromUrl = searchParams.get('min_price') || '';
    const maxPriceFromUrl = searchParams.get('max_price') || '';

    // Update states in a single batch
    setCategory(categoryFromUrl);
    setSearch(searchFromUrl);
    setSortBy(sortFromUrl);
    setMinPrice(minPriceFromUrl);
    setMaxPrice(maxPriceFromUrl);
    // Clear products immediately when URL changes to prevent showing stale data
    setAllProducts([]);
    // Note: page reset to 1 is handled by the filterKey effect
  }, [searchParams]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', page, search, category, sortBy, minPrice, maxPrice],
    queryFn: () => productsAPI.getAll({
      page,
      limit: 20,
      search: search.length >= 3 ? search : '',
      category_id: category,
      sort: sortBy,
      min_price: minPrice,
      max_price: maxPrice,
      include_subcategories: true, // Include subcategories when filtering by parent
    }),
    keepPreviousData: true,
  });

  // Track filter changes to know when to reset vs accumulate
  const filterKey = useMemo(
    () => `${search}-${category}-${sortBy}-${minPrice}-${maxPrice}`,
    [search, category, sortBy, minPrice, maxPrice]
  );
  const prevFilterKeyRef = useRef(filterKey);

  // Accumulate products as we load more pages
  useEffect(() => {
    // Only update when we have fresh data (not cached from keepPreviousData)
    // This prevents duplicate products when navigating pages
    // Check for data existence, not just products array (to handle empty arrays)
    if (data?.products !== undefined && !isFetching) {
      const filtersChanged = prevFilterKeyRef.current !== filterKey;
      
      if (filtersChanged) {
        // Filters changed - reset to page 1 and clear products
        prevFilterKeyRef.current = filterKey;
        // Only reset page if it's not already 1 to avoid cascading renders
        if (page !== 1) {
          setPage(1);
        }
        setAllProducts(data.products);
      } else if (page === 1) {
        // Page 1 without filter change - reset products
        setAllProducts(data.products);
      } else {
        // Append new products on subsequent pages
        setAllProducts((prev) => [...prev, ...data.products]);
      }
    }
  }, [data, page, isFetching, filterKey]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  });

  const pagination = data?.pagination || {};
  const categories = categoriesData?.data || [];

  // Build category map for quick lookup
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.id] = cat;
    });
    return map;
  }, [categories]);

  // Build hierarchical category options
  const categoryOptions = useMemo(() => {
    const options = [];
    const parents = categories.filter(cat => !cat.parent_id || cat.parent_id === 0);
    const children = categories.filter(cat => cat.parent_id && cat.parent_id !== 0);
    
    parents.forEach(parent => {
      options.push({ id: parent.id, name: parent.name, isParent: true });
      children
        .filter(child => child.parent_id === parent.id)
        .forEach(child => {
          options.push({ id: child.id, name: `└ ${child.name}`, isChild: true, parentId: parent.id });
        });
    });
    
    return options;
  }, [categories]);

  // Get current category info and breadcrumb
  const currentCategory = category ? categoryMap[Number.parseInt(category, 10)] : null;
  const parentCategory = currentCategory?.parent_id ? categoryMap[currentCategory.parent_id] : null;

  const handleResetFilters = () => {
    setCategory('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setPage(1);
  };

  const hasMoreProducts = page < pagination.pages;

  const handleLoadMore = () => {
    if (hasMoreProducts && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-xl text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />

      {/* Breadcrumb and Title */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        {currentCategory && (
          <nav className="mb-6">
            <ol className="flex items-center flex-wrap gap-2 text-sm">
              <li>
                <Link href="/" className="text-purple-600 hover:text-purple-800 transition">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/products" className="text-purple-600 hover:text-purple-800 transition">
                  Products
                </Link>
              </li>
              {parentCategory && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <Link 
                      href={`/products?category=${parentCategory.id}`}
                      className="text-purple-600 hover:text-purple-800 transition"
                    >
                      {parentCategory.name}
                    </Link>
                  </li>
                </>
              )}
              <li className="text-gray-400">/</li>
              <li className="text-gray-800 font-semibold">{currentCategory.name}</li>
            </ol>
          </nav>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {currentCategory ? (
              <>
                <span className="gradient-text">{currentCategory.name}</span>
                {parentCategory && !currentCategory.parent_id && (
                  <span className="block text-lg font-normal text-gray-500 mt-2">
                    Including all subcategories
                  </span>
                )}
              </>
            ) : (
              <>
                Discover <span className="gradient-text">Amazing Products</span>
              </>
            )}
          </h1>
          <p className="text-gray-600 text-lg">
            {currentCategory 
              ? `Explore our ${currentCategory.name.toLowerCase()} collection`
              : 'Browse through our curated collection'
            }
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Search for products (min 3 characters)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-6 py-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg text-lg"
            />
            {search.length > 0 && search.length < 3 && (
              <div className="absolute left-6 top-full mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg z-10 pointer-events-none">
                ⚠️ Enter at least 3 characters to search
              </div>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8 border border-purple-100 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">🎯 Refine Your Search</h3>
              <button
                onClick={handleResetFilters}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label htmlFor="category-filter" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <span>📁</span> Category
                </label>
                <select
                  id="category-filter"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition font-medium"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option 
                      key={cat.id} 
                      value={cat.id}
                      className={cat.isChild ? 'pl-4' : 'font-semibold'}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sort-by-filter" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <span>🔄</span> Sort By
                </label>
                <select
                  id="sort-by-filter"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition font-medium"
                >
                  <option value="">Default</option>
                  <option value="price_asc">💰 Price: Low to High</option>
                  <option value="price_desc">💰 Price: High to Low</option>
                  <option value="name_asc">🔤 Name: A to Z</option>
                  <option value="name_desc">🔤 Name: Z to A</option>
                  <option value="newest">✨ Newest First</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label htmlFor="min-price-filter" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <span>💵</span> Min Price
                </label>
                <input
                  id="min-price-filter"
                  type="number"
                  placeholder="$ 0"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                />
              </div>

              {/* Max Price */}
              <div>
                <label htmlFor="max-price-filter" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <span>💵</span> Max Price
                </label>
                <input
                  id="max-price-filter"
                  type="number"
                  placeholder="$ 1000"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        {/* Loading skeleton for initial load */}
        {isLoading && page === 1 && (!allProducts || allProducts.length === 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={`skeleton-initial-${i}`} className="skeleton h-96 rounded-2xl"></div>
            ))}
          </div>
        )}

        {/* No products found */}
        {allProducts && allProducts.length === 0 && !isLoading && !isFetching && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Products grid */}
        {allProducts && allProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 group animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden">
                  {product.is_featured && (
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ Featured
                    </div>
                  )}
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <span className="text-5xl">🎁</span>
                    </div>
                  )}
                  {product.stock_quantity > 0 ? (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ✓ Available
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Sold Out
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-purple-600 transition min-h-[56px]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      ${Number.parseFloat(product.price).toFixed(2)}
                    </p>
                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                      View
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {product.stock_quantity} {product.stock_quantity === 1 ? 'item' : 'items'} in stock
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Loading skeleton for more products */}
        {isFetching && page > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`skeleton-more-${i}`} className="skeleton h-96 rounded-2xl"></div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {allProducts && allProducts.length > 0 && (
          <div className="flex flex-col items-center mt-12 gap-4">
            {hasMoreProducts ? (
              <>
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isFetching ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Load More Products
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </button>
                <p className="text-gray-600 text-sm">
                  Showing <span className="font-bold text-purple-600">{allProducts?.length || 0}</span> of{' '}
                  <span className="font-bold text-purple-600">{pagination.total}</span> products{' '}
                  <span className="mx-2">•</span> Page <span className="font-bold">{page}</span> of <span className="font-bold">{pagination.pages}</span>
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-8 py-4">
                  <p className="text-gray-700 font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    You've reached the end! All <span className="font-bold text-purple-600">{allProducts?.length || 0}</span> products loaded
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center py-32">
            <div className="text-xl text-gray-600">Loading products...</div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
