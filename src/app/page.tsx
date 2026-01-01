'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hotel, MapPin, CreditCard, Shield, ArrowRight, Sparkles, TrendingUp, Users, Star, Search, GitCompare, CheckCircle } from "lucide-react";
import heroImage from "@/assets/Images/Hero/Hero.png";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroImageUrl = typeof heroImage === 'string' 
    ? heroImage 
    : (heroImage as any)?.src || heroImage;

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section with Parallax */}
      <div className="relative text-white overflow-hidden min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url(${heroImageUrl})`,
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-spin-slow" />
              <span className="text-sm font-medium">Exclusive Deals Available</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-gradient">
              Discover Amazing
              <br />
              <span className="text-blue-300">Hotel Offers</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto leading-relaxed">
              Get exclusive discounts and deals from top hotels with your bank cards across Sri Lanka
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/hotel-offers"
                className="group relative inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">View Hotel Offers</span>
                <ArrowRight className="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link
                href="/hotel-offers"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>

            {/* Quick Stats in Hero */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              {[
                { value: '50+', label: 'Hotels' },
                { value: '6', label: 'Banks' },
                { value: '25%', label: 'Savings' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Features Section - We Offer Style */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image / Visual */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-xl bg-gray-200 h-72 md:h-80">
                {/* Placeholder gradient block; replace with real image if you have one */}
                <div className="w-full h-full bg-[radial-gradient(circle_at_top,_#1d4ed8_0,_#0ea5e9_40%,_#0f172a_100%)] opacity-90" />
              </div>
              {/* Small badge */}
              <div className="absolute -bottom-6 left-8 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                  HOT
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Best hotel offers</p>
                  <p className="text-xs text-gray-500">Curated deals across Sri Lanka</p>
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-blue-500 mb-3">
                We Offer
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                Save more on<br className="hidden md:block" /> your next hotel stay.
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                Unlock exclusive discounts on hotel stays when you pay with your favorite bank cards.
                Browse offers from top hotels, filter by bank and card type, and quickly compare deals
                to find the perfect stay.
              </p>

              <ul className="space-y-3 text-sm md:text-base text-gray-700 mb-8">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gray-900" />
                  <span>Exclusive hotel offers across Sri Lanka, updated regularly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gray-900" />
                  <span>Filter by bank and card type to see only the discounts you can use.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gray-900" />
                  <span>Compare multiple offers side by side before you decide.</span>
                </li>
              </ul>

              <Link
                href="/hotel-offers"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gray-900 text-white text-sm md:text-base font-semibold shadow-md hover:bg-black transition-colors"
              >
                View Hotel Offers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Card Style */}
      <div className="py-20 bg-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-blue-500">
              Our Process
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              Simple steps to find the best hotel offer
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover, compare, and choose the perfect hotel offer for your next stay. No booking here – we help you decide what&apos;s best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 md:items-start">
            {/* Card 1 - Browse Offers */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:mt-20">
              {/* Top Image / Banner */}
              <div className="h-40 bg-gradient-to-tr from-blue-500 to-blue-400 relative flex items-center justify-center">
                <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Search className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Browse Offers
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Search hotel offers across Sri Lanka</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Filter by location, bank, and card type</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>See valid dates, discounts, and terms</span>
                    </li>
                  </ul>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-blue-700">
                      BO
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Browse Only</p>
                      <p className="text-[11px] text-gray-500">No booking required</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="font-semibold text-gray-800">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Compare Offers */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:mt-0">
              <div className="h-40 bg-gradient-to-tr from-indigo-500 to-purple-500 relative flex items-center justify-center">
                <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <GitCompare className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Compare Offers
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Select multiple hotel offers from the list</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Open the comparison view to see details side by side</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Compare discounts, banks, and card types easily</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-semibold text-purple-700">
                      CO
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Compare View</p>
                      <p className="text-[11px] text-gray-500">Side-by-side details</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="font-semibold text-gray-800">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Select Offers */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:mt-30">
              <div className="h-40 bg-gradient-to-tr from-emerald-500 to-teal-500 relative flex items-center justify-center">
                <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select Offers
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Choose the hotel offer that matches your budget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>View full terms, conditions, and validity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-800" />
                      <span>Use the details to book directly with the hotel</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-semibold text-emerald-700">
                      SO
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Your Choice</p>
                      <p className="text-[11px] text-gray-500">Decide with confidence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="font-semibold text-gray-800">4.7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Circular Style */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
            {/* Stat 1 */}
            <div className="relative flex items-center justify-center md:mt-20">
              <div className="relative flex items-center justify-center w-40 h-40 md:w-44 md:h-44 rounded-full border-[6px] border-sky-200 bg-sky-50">
                <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36 rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">50+</div>
                    <div className="mt-1 text-sm text-gray-500">Partner Hotels</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 right-4 w-4 h-4 rounded-full bg-sky-400 border-4 border-white shadow-sm" />
            </div>

            {/* Stat 2 */}
            <div className="relative flex items-center justify-center md:mt-0">
              <div className="relative flex items-center justify-center w-40 h-40 md:w-44 md:h-44 rounded-full border-[6px] border-sky-200 bg-sky-50">
                <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36 rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">6</div>
                    <div className="mt-1 text-sm text-gray-500">Bank Partners</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 right-4 w-4 h-4 rounded-full bg-sky-400 border-4 border-white shadow-sm" />
            </div>

            {/* Stat 3 */}
            <div className="relative flex items-center justify-center md:mt-30">
              <div className="relative flex items-center justify-center w-40 h-40 md:w-44 md:h-44 rounded-full border-[6px] border-sky-200 bg-sky-50">
                <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36 rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">1000+</div>
                    <div className="mt-1 text-sm text-gray-500">Happy Customers</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 right-4 w-4 h-4 rounded-full bg-sky-400 border-4 border-white shadow-sm" />
            </div>

            {/* Stat 4 */}
            <div className="relative flex items-center justify-center md:mt-10">
              <div className="relative flex items-center justify-center w-40 h-40 md:w-44 md:h-44 rounded-full border-[6px] border-sky-200 bg-sky-50">
                <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36 rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">25%</div>
                    <div className="mt-1 text-sm text-gray-500">Average Savings</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-1 right-4 w-4 h-4 rounded-full bg-sky-400 border-4 border-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Save on Your Next Hotel Stay?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse our exclusive hotel offers and start saving today with amazing discounts
          </p>
          <Link
            href="/hotel-offers"
            className="group inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <span>View All Offers</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}