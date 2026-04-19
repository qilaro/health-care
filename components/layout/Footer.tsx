import Link from "next/link";
import { Pill, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-16">
      <div className="container-medq py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DB3924" }}>
                <Pill className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">MedQ</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Learn more. Live better. Your trusted source for comprehensive drug information and medication guidance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-200">Drug Tools</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/drugs" className="hover:text-white transition-colors">Drug Directory</Link></li>
              <li><Link href="/interaction-checker" className="hover:text-white transition-colors">Interaction Checker</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Drug Comparison</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-200">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/chatbot" className="hover:text-white transition-colors">AI Health Assistant</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">Health News</Link></li>
              <li><Link href="/bookmarks" className="hover:text-white transition-colors">My Bookmarks</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-200">Disclaimer</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              MedQ provides information for educational purposes only. Always consult a qualified healthcare professional before making any medical decisions. In an emergency, call 911.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2025 MedQ. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-400" /> for better health
          </p>
        </div>
      </div>
    </footer>
  );
}
