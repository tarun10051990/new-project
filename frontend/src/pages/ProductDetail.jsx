import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    setQuantity(1);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[400px] bg-gray-200 rounded-lg" />
          <div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-12 bg-gray-200 rounded w-1/2 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-600">Product not found</h2>
        <Link to="/" className="text-[#0078ad] mt-4 inline-block hover:underline">Go back to home</Link>
      </div>
    );
  }

  const discount = product.discount_percent || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <Link to="/" className="hover:text-[#0078ad]">Home</Link>
        <span>/</span>
        {product.category_slug && (
          <>
            <Link to={`/category/${product.category_slug}`} className="hover:text-[#0078ad]">{product.category_name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl p-6 shadow-sm">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square bg-gray-50 rounded-lg p-6 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Product'; }}
            />
          </div>
          {discount > 0 && (
            <span className="absolute top-4 left-4 badge-discount text-sm px-3 py-1">
              {Math.round(discount)}% OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="text-sm text-gray-500 mb-1">{product.brand}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-sm">
              <FiStar size={12} fill="white" />
              <span>{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">&#8377;{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">&#8377;{product.mrp}</span>
                  <span className="text-green-600 font-semibold">
                    Save &#8377;{(product.mrp - product.price).toFixed(0)}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">(Inclusive of all taxes)</p>
          </div>

          {/* Unit info */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span>Pack Size: <strong>{product.unit}</strong></span>
            {product.weight && <span>Weight: <strong>{product.weight}</strong></span>}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold">Qty:</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-12 h-10 flex items-center justify-center border-x font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
            >
              <FiShoppingCart size={18} />
              Add to Cart
            </button>
            <button className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors">
              <FiHeart size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t">
            <div className="text-center">
              <FiTruck className="mx-auto text-[#0078ad] mb-1" size={20} />
              <div className="text-xs text-gray-600">Free Delivery</div>
            </div>
            <div className="text-center">
              <FiShield className="mx-auto text-[#0078ad] mb-1" size={20} />
              <div className="text-xs text-gray-600">Genuine Product</div>
            </div>
            <div className="text-center">
              <FiRefreshCw className="mx-auto text-[#0078ad] mb-1" size={20} />
              <div className="text-xs text-gray-600">Easy Returns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
          <div className="product-scroll">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
