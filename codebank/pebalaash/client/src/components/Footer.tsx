import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#232F3E] text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About Column */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Get to Know Us</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">About Pebalaash</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Careers</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Press Releases</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Science & Tech</li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Let Us Help You</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Your Account</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Your Orders</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Shipping Rates & Policies</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Returns & Replacements</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Help Centre</li>
          </ul>
        </div>

        {/* Money Column */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Make Money with Us</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Sell on Pebalaash</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Protect & Build Your Brand</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Become an Affiliate</li>
            <li className="hover:text-[#FFD814] cursor-pointer transition-colors">Advertise Your Products</li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Contact Us</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#FFD814]" />
              <span>Digital Valley, Silicon District, DXB</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#FFD814]" />
              <span>+971 4 000 0000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#FFD814]" />
              <span>support@pebalaash.tech</span>
            </li>
            <li className="flex gap-4 mt-6 pt-4 border-t border-gray-700">
              <Facebook className="w-5 h-5 hover:text-[#FFD814] cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-[#FFD814] cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-[#FFD814] cursor-pointer" />
              <Youtube className="w-5 h-5 hover:text-[#FFD814] cursor-pointer" />
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-400">
          © 2026 Pebalaash.tech. All rights reserved. | 
          <span className="mx-2 hover:text-white cursor-pointer">Conditions of Use</span> | 
          <span className="mx-2 hover:text-white cursor-pointer">Privacy Notice</span>
        </p>
      </div>
    </footer>
  );
}
