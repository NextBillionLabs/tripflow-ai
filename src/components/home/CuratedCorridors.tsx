import Image from "next/image";

const corridors = [
  {
    badge: "Weekend Special",
    badgeColor: "bg-white text-slate-900",
    tag: "Hill Station",
    tagColor: "bg-emerald-950/80 text-emerald-200",
    distance: "160 km · 3.5 hrs",
    route: "NH-56 Scenic Corridor",
    routeColor: "text-teal-700",
    duration: "2D / 1N",
    title: "Surat ➔ Saputara Hills",
    description:
      "Includes lake-view resort stay, fuel & toll estimates, sunset point fog trails, and Waghai tea halt.",
    price: "₹4,250",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
    imageAlt: "Saputara green misty hills and ghat road",
  },
  {
    badge: "Heritage Luxe",
    badgeColor: "bg-amber-400 text-slate-950",
    tag: "Lake Pichola",
    tagColor: "bg-white/30 text-white backdrop-blur-md",
    distance: "260 km · 4.5 hrs",
    route: "NH-48 6-Lane Expressway",
    routeColor: "text-amber-700",
    duration: "3D / 2N",
    title: "Ahmedabad ➔ Udaipur",
    description:
      "Lakeside heritage haveli, sunset Pichola boat tickets guaranteed, Mewari dinner & City Palace pass.",
    price: "₹6,999",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    imageAlt: "Udaipur City Palace and Lake Pichola at sunset",
  },
  {
    badge: "Candid Discovery",
    badgeColor: "bg-teal-500 text-white",
    tag: "Eco Trail",
    tagColor: "bg-emerald-950/80 text-emerald-200",
    distance: "140 km · 3 hrs",
    route: "Dang Tribal Belt Route",
    routeColor: "text-teal-700",
    duration: "2D / 1N",
    title: "Dang Monsoon Forest Trail",
    description:
      "Verified forest eco-cottage, Gira Falls walk, authentic organic Nagli rotla lunch, certified local guide.",
    price: "₹3,600",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    imageAlt: "Dang monsoon forest trail with lush green canopy",
  },
];

export default function CuratedCorridors() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto" id="curated">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-teal-700 font-bold tracking-wider uppercase text-xs">
            Top Handcrafted Corridors
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Popular Weekend Road Trips & Packages
          </h2>
        </div>
        <a
          href="#"
          className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
        >
          <span>View All 24 Corridors</span>
          <span className="material-symbols-outlined text-[16px]">east</span>
        </a>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {corridors.map((corridor) => (
          <article
            key={corridor.title}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                alt={corridor.imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={corridor.image}
                width={800}
                height={400}
                unoptimized
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${corridor.badgeColor}`}
                >
                  {corridor.badge}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${corridor.tagColor}`}
                >
                  {corridor.tag}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-semibold">
                {corridor.distance}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${corridor.routeColor}`}>
                  {corridor.route}
                </span>
                <span className="text-xs font-semibold text-slate-500">{corridor.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{corridor.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{corridor.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">Starts from</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {corridor.price}
                    <span className="text-xs font-normal text-slate-500">/person</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View Plan</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
