import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#0078ad] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="font-bold text-xl">JioMart</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop online shopping destination for groceries, electronics, fashion, beauty, and more.
              Get the best deals delivered to your doorstep.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Categories</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/category/fruits-vegetables" className="hover:text-white transition-colors">Grocery</Link></li>
              <li><Link to="/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/category/fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/category/beauty" className="hover:text-white transition-colors">Beauty</Link></li>
              <li><Link to="/category/home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/category/personal-care" className="hover:text-white transition-colors">Personal Care</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Customer Service</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">About Us</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Return Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Shipping Policy</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p>Call us: 1800 890 1222</p>
              <p>8:00 AM to 8:00 PM, 365 days</p>
              <p>Email: support@jiomart.com</p>
              <div className="flex gap-3 mt-4">
                <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm hover:bg-[#0078ad] transition-colors cursor-pointer">f</span>
                <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm hover:bg-[#0078ad] transition-colors cursor-pointer">t</span>
                <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm hover:bg-[#0078ad] transition-colors cursor-pointer">in</span>
                <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm hover:bg-[#0078ad] transition-colors cursor-pointer">yt</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2024 JioMart Clone. All rights reserved. Built for demo purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
