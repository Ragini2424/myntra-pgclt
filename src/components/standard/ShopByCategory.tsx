import React from 'react';

interface CategoryCard {
  id: string;
  name: string;
  discount: string;
  image: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: 'ethnic',
    name: 'Ethnic Wear',
    discount: '50-80% OFF',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'casual',
    name: 'Casual Wear',
    discount: '40-80% OFF',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'mens-active',
    name: "Men's Activewear",
    discount: '30-70% OFF',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'womens-active',
    name: "Women's Activewear",
    discount: '30-70% OFF',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'western',
    name: 'Western Wear',
    discount: '40-80% OFF',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sportswear',
    name: 'Sportswear',
    discount: '30-80% OFF',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'loungewear',
    name: 'Loungewear',
    discount: '40-70% OFF',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'innerwear',
    name: 'Innerwear',
    discount: 'Up To 60% OFF',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'lingerie',
    name: 'Lingerie',
    discount: 'Min. 50% OFF',
    image: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'watches',
    name: 'Watches',
    discount: '30-70% OFF',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'grooming',
    name: 'Grooming',
    discount: 'Up To 50% OFF',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'beauty',
    name: 'Beauty & Makeup',
    discount: '40-70% OFF',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  },
];

interface ShopByCategoryProps {
  onSelectCategory?: (category: string) => void;
}

export function ShopByCategory({ onSelectCategory }: ShopByCategoryProps) {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 my-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#29303E] tracking-widest uppercase">
          SHOP BY CATEGORY
        </h2>
      </div>

      {/* Grid of Category Cards matching Screenshot 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
            className="group cursor-pointer bg-white rounded-lg border-2 border-[#FED7AA] hover:border-[#FD913C] p-2 transition-all duration-300 hover:shadow-md flex flex-col items-center"
          >
            {/* Image Container */}
            <div className="w-full h-44 sm:h-52 overflow-hidden rounded-md bg-gray-100 mb-2.5 relative">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Label Details matching Screenshot 2 */}
            <div className="text-center w-full pb-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#29303E] tracking-tight group-hover:text-[#F13AB1] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              {cat.discount && (
                <p className="text-sm sm:text-base font-black text-black tracking-tight mt-0.5">
                  {cat.discount}
                </p>
              )}
              <span className="text-[10px] font-bold text-gray-600 hover:underline block mt-0.5">
                Shop Now
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
