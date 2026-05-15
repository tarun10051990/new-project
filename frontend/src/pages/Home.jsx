import { useState, useEffect } from 'react';
import api from '../utils/api';
import BannerCarousel from '../components/BannerCarousel';
import CategorySection from '../components/CategorySection';
import { Link } from 'react-router-dom';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, productsRes] = await Promise.all([
          api.get('/banners'),
          api.get('/products/by-category')
        ]);
        setBanners(bannersRes.data);
        setCategoriesWithProducts(productsRes.data);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-[280px] bg-gray-200 rounded-lg mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-[200px] flex-shrink-0">
                    <div className="h-[200px] bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Banner */}
      <BannerCarousel banners={banners} />

      {/* Quick categories grid */}
      <div className="my-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {[
          { name: 'Fruits & Veggies', slug: 'fruits-vegetables', emoji: '🥬', color: 'bg-green-50' },
          { name: 'Dairy & Bakery', slug: 'dairy-bakery', emoji: '🥛', color: 'bg-blue-50' },
          { name: 'Staples', slug: 'staples', emoji: '🌾', color: 'bg-yellow-50' },
          { name: 'Snacks', slug: 'snacks-beverages', emoji: '🍿', color: 'bg-orange-50' },
          { name: 'Electronics', slug: 'electronics', emoji: '📱', color: 'bg-purple-50' },
          { name: 'Fashion', slug: 'fashion', emoji: '👕', color: 'bg-pink-50' },
        ].map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className={`${cat.color} rounded-xl p-3 text-center hover:shadow-md transition-shadow`}
          >
            <div className="text-3xl mb-1">{cat.emoji}</div>
            <div className="text-xs font-medium text-gray-700">{cat.name}</div>
          </Link>
        ))}
      </div>

      {/* Deal banner */}
      <div className="bg-gradient-to-r from-[#0078ad] to-[#00a5e0] rounded-xl p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Deals of the Day</h2>
            <p className="text-white/80">Up to 50% off on all categories. Shop now!</p>
          </div>
          <Link to="/category/snacks-beverages" className="bg-white text-[#0078ad] px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Product sections by category */}
      {categoriesWithProducts.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}
