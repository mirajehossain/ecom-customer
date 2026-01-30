'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';

export default function FeaturedSlider({ products, isLoading }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="skeleton h-12 w-80 mx-auto mb-4 rounded-lg"></div>
            <div className="skeleton h-6 w-96 mx-auto rounded-lg"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-80 w-72 flex-shrink-0 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Shop Smart, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Live Better</span>
          </h2>
          <p className="text-xl md:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">
            Where Style Meets Uniqueness
          </p>
          <p className="text-gray-600 text-lg">
            Discover amazing products at unbeatable prices
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-purple-50 hover:scale-110 transition-all border border-gray-100 group"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-purple-50 hover:scale-110 transition-all border border-gray-100 group"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Embla Carousel */}
          <div className="overflow-hidden mx-8" ref={emblaRef}>
            <div className="flex gap-6">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex-shrink-0 w-[280px] md:w-[320px] group"
                >
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-2">
                    {/* Product Image */}
                    <div className="relative h-64 md:h-72 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 flex items-center justify-center">
                          <span className="text-6xl">✨</span>
                        </div>
                      )}
                      
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                            View Product →
                          </span>
                        </div>
                      </div>

                      {/* Featured Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Featured
                        </span>
                      </div>

                      {/* Stock Badge */}
                      {product.stock_quantity > 0 ? (
                        <div className="absolute top-3 right-3 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          In Stock
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-red-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Shop Now
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Explore All Featured Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
