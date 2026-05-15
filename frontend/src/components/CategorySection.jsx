import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { FiChevronRight } from 'react-icons/fi';

export default function CategorySection({ category }) {
  if (!category.products || category.products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
        <Link
          to={`/category/${category.slug}`}
          className="text-[#0078ad] text-sm font-semibold hover:underline flex items-center gap-1"
        >
          View all <FiChevronRight size={16} />
        </Link>
      </div>

      <div className="product-scroll">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
