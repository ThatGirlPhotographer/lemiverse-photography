import { useState } from "react";

interface JourneyItem {
  date: string;
  title: string;
  detail: string;
}

interface KitItem {
  name: string;
  price: number;
  image: string;
}

export default function About() {
  const [activeRoadmapIdx, setActiveRoadmapIdx] = useState<number | null>(null);

  const journeyData: JourneyItem[] = [
    { date: "JAN 2023", title: "The Start", detail: "That moment when i first discovered background blur completely blew my mind. i was just messing about with my phone camera, not taking anything seriously, but seeing that soft bokeh effect come to life—something clicked." },
    { date: "MAY 2023", title: "The Learning", detail: "i threw myself into experimentation with raw enthusiasm. shooting boats, buses, vehicles—anything that would stand still long enough." },
    { date: "SEP 2023-Jan 24", title: "Lights and Scenery", detail: "This period was all about unlocking the magic of light. i spent time studying how golden hour transforms a scene, how shadows tell stories." },
    { date: "MAR 2024", title: "Landscape/Portrait", detail: "The model show was my turning point. surrounded by other creatives, something finally clicked about positioning and framing." },
    { date: "MAY 2024", title: "Portfolio", detail: "Creating my first portfolio felt like holding my own dreams in my hands. i curated my best work, piecing together a visual narrative." },
    { date: "SEP 2024", title: "Taste of Beauty", detail: "Holding the Canon 750D for the first time was a revelation. the weight of it, the glass, the real lens—it felt like i was finally stepping into the professional world." },
    { date: "OCT 2024", title: "The Upgrade", detail: "Getting the Canon EOS R10 was more than just a gear upgrade—it was permission to dream bigger." },
    { date: "JAN 2025", title: "The Learning Pt2", detail: "i locked myself in and really committed to understanding my camera inside-out. then came Photoshop—a whole new universe of creative control." },
    { date: "MAR 2025", title: "The Business", detail: "Buckfield Photography—i said it out loud and it became real. this wasn't just a hobby anymore; it was becoming a dream worth pursuing seriously." },
    { date: "JUN 2025", title: "The Game", detail: "Photoshop mastery arrived alongside a creative awakening. i started chasing cinematic compositions, moody tones, and storytelling qualities." },
    { date: "AUG 2025", title: "Galaxy amongst the frame", detail: "Then Galaxy arrived, and everything shifted. his presence sparked a whole new passion for pet and animal photography." },
    { date: "JAN 2026", title: "The Launch", detail: "January 2026 came with the official launch of Lemiverse Photography. it represents everything i've learned, every stumble, every breakthrough." }
  ];

  const kitData: KitItem[] = [
    { name: "Canon EOS R10 Mirrorless Camera", price: 999.99, image: "https://i1.adis.ws/i/canon/5331C044_EOS-R10_03?w=608&bg=rgb(245,246,246)&fmt=webp&qlt=80&sm=aspect&aspect=4:3" },
    { name: "Canon RF-S 10-18mm F4.5-6.3 IS STM Lens", price: 100, image: "https://img.photographyblog.com/reviews/canon_rf_s_10_18mm_f4_5_6_3_is_stm/canon_rf_s_10_18mm_f4_5_6_3_is_stm_12.jpg" },
    { name: "K&F CONCEPT EF to EOS R Adapter", price: 45.04, image: "https://m.media-amazon.com/images/I/715NYVHKPsL._AC_SL1500_.jpg" },
    { name: "Sigma AF 70-300mm f4-5.6 DG APO Macro", price: 115, image: "https://m.media-amazon.com/images/I/61detU7PZ7L._AC_SY879_.jpg" }
  ];

  const totalKitValue = kitData.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-black text-white py-20 min-h-screen font-['Lato',sans-serif]">
      <header className="text-center text-4xl tracking-[7px] font-light uppercase mt-5 mb-2">
        ABOUT ME
      </header>
      <p className="text-center text-gray-400 text-sm tracking-wider mb-20 max-w-[600px] mx-auto px-5">
        A timeline of perfecting my frame since Late 2022.
      </p>

      {/* Roadmap Section */}
      <div className="relative w-[90%] max-w-[600px] mx-auto mb-24 pl-10">
        {journeyData.map((item, idx) => (
          <div 
            key={idx} 
            className="relative mb-[-1px] cursor-crosshair group"
            onClick={() => setActiveRoadmapIdx(activeRoadmapIdx === idx ? null : idx)}
          >
            {/* Vertical Line Connector */}
            {idx !== journeyData.length - 1 && (
              <div className="absolute left-[-40px] top-[25px] bottom-[-25px] w-[1px] bg-white z-0" />
            )}
            {/* Horizontal Line Connector */}
            <div className="absolute left-[-40px] top-[25px] w-[40px] h-[1px] bg-white" />

            <div className={`border border-white p-5 relative z-10 transition-all duration-300 ${activeRoadmapIdx === idx ? 'bg-zinc-900' : 'hover:bg-zinc-900'}`}>
              <span className="block text-[0.7rem] tracking-[3px] text-[#c5a059] uppercase mb-1">
                {item.date}
              </span>
              <h3 className="text-lg font-normal tracking-[2px] uppercase">{item.title}</h3>
              
              <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${activeRoadmapIdx === idx ? 'max-h-96 opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-400 text-[0.85rem] leading-relaxed">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kit Section */}
      <section className="max-w-[1000px] mx-auto px-5">
        <header className="text-2xl text-center uppercase tracking-[4px] mb-10">THE ARSENAL</header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {kitData.map((item, idx) => (
            <div key={idx} className="border border-zinc-800 p-5 text-center transition-all hover:border-[#c5a059] group">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-44 object-cover grayscale group-hover:grayscale-0 transition-all duration-300 mb-4"
              />
              <div className="text-[0.9rem] tracking-[2px] uppercase mb-2 h-12 overflow-hidden">
                {item.name}
              </div>
              <div className="text-sm text-[#c5a059] font-light">
                £{item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center border-t border-zinc-800 pt-10 mt-10">
          <div className="text-[0.7rem] tracking-[4px] text-gray-500 uppercase">Estimated Kit Value</div>
          <div className="text-3xl font-thin mt-2 tracking-tighter">
            ~£{totalKitValue.toLocaleString()}
          </div>
        </div>
      </section>
    </div>
  );
}