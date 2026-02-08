'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Header from './components/Header';
import FeaturedSlider from './components/FeaturedSlider';
import { productsAPI } from '@/lib/api';

export default function Home() {
  // Fetch featured products (using the dedicated featured endpoint)
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeatured(8),
  });

  // Fetch latest products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => productsAPI.getAll({ page: 1, limit: 8 }),
  });

  const featuredProducts = featuredData?.products || [];
  const products = productsData?.products || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-24 md:py-32 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fadeIn">
              Shop Smart, Live Better
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 mt-2">
                Where Style Meets Uniqueness
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              Discover amazing products at unbeatable prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/products"
                className="btn-ripple bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                🛍️ Shop Now
              </Link>
              <Link
                href="/products"
                className="btn-ripple bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105"
              >
                Explore Deals
              </Link>
            </div>
          </div>
        </div>

        {/* Wave SVG at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249, 250, 251)" fillOpacity="0.5" />
            <path d="M0 40L60 46.7C120 53 240 67 360 73.3C480 80 600 80 720 73.3C840 67 960 53 1080 46.7C1200 40 1320 40 1380 40H1440V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="rgb(249, 250, 251)" />
          </svg>
        </div>
      </section>

      {/* Featured Products Slider Section */}
      <FeaturedSlider products={featuredProducts} isLoading={featuredLoading} />

      {/* Featured Products Section */}
      {(featuredLoading || featuredProducts.length > 0) && (
        <section className="py-20 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">⭐ Featured</span> Products
                </h2>
                <p className="text-gray-600">Our top picks, handpicked just for you</p>
              </div>
              <Link
                href="/products?featured=true"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
              >
                View All <span>→</span>
              </Link>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-amber-200 group relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ Featured
                    </div>
                    <div className="relative overflow-hidden">
                      {product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || product.image ? (
                        <img
                          src={product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || product.image}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <span className="text-4xl">⭐</span>
                        </div>
                      )}
                      {product.stock_quantity > 0 ? (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ✓ In Stock
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Sold Out
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Buy Now
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-8 md:hidden">
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
              >
                View All Featured <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                <span className="gradient-text">Latest</span> Products
              </h2>
              <p className="text-gray-600">Fresh arrivals for you</p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              View All <span>→</span>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No products available yet</h3>
              <p className="text-gray-600">Check back soon for exciting products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    {product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || product.image ? (
                      <img
                        src={product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">🎁</span>
                      </div>
                    )}
                    {product.stock_quantity > 0 ? (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ✓ In Stock
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Sold Out
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Buy Now
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              View All Products <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Why Shop With Us</h2>
            <p className="text-gray-600 text-lg">We deliver excellence in every aspect</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Secure Payment</h3>
              <p className="text-gray-600 leading-relaxed">100% secure checkout with SSL encryption and trusted payment gateways</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Express shipping available. Get your products delivered to your doorstep</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Quality Guaranteed</h3>
              <p className="text-gray-600 leading-relaxed">Premium quality products with hassle-free returns and refunds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">🛍️ Unique Style Zone</h3>
              <p className="text-gray-300">Your one-stop shop for quality products at amazing prices.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/products" className="hover:text-purple-400 transition">Products</Link></li>
                <li><Link href="/cart" className="hover:text-purple-400 transition">Cart</Link></li>
                <li><Link href="/orders" className="hover:text-purple-400 transition">Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-purple-400 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Shipping Info</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition">
                  <span>f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition">
                  <span>𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition">
                  <span>in</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Unique Style Zone. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
