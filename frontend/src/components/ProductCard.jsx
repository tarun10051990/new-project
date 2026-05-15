import { Link } from 'react-router-dom';
import { FiHeart, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    const success = await addToCart(product.id);
    if (success) {
      toast.success('Added to cart!');
    }
  };

  const discount = product.discount_percent || 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="card group block min-w-[180px] max-w-[220px] flex-shrink-0 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 p-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Product'; }}
        />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge-discount">
            {Math.round(discount)}% OFF
          </span>
        )}

        {/* Wishlist */}
        <button
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <FiHeart size={16} className="text-gray-400 hover:text-red-500" />
        </button>

        {/* Add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 bg-[#0078ad] text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#006090] transition-colors shadow-md"
        >
          <FiPlus size={14} />
          Add
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-1">{product.unit}</div>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-base">&#8377;{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-gray-400 text-sm line-through">&#8377;{product.mrp}</span>
          )}
        </div>
        {product.brand && (
          <div className="text-xs text-gray-500 mt-1">{product.brand}</div>
        )}
      </div>
    </Link>
  );
}
