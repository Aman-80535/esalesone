import Categories from '@/app/components/Categories';
import Link from 'next/link';

export const metadata = {
  title: 'Shop Categories | Shopi E-Commerce',
  description: 'Browse all fashion categories: Men, Women, Latest Collections, and Sale Deals.',
};

export default function CategoriesPage() {
  return (
    <div className="bg-[#f2f7f5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs text-gray-500 font-medium mb-4">
          <Link href="/" className="hover:text-emerald-800">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-bold">Categories</span>
        </nav>
      </div>
      <Categories />
    </div>
  );
}
