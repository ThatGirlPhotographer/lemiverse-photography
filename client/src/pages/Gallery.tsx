import { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import FsLightbox from "fslightbox-react";

interface GalleryItem {
  id: number;
  filename: string;
  caption: string;
  media_type: "image" | "video";
}

interface Category {
  category_id: string;
  name: string;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  
  // Lightbox State
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1
  });

  useEffect(() => {
    fetchData();
  }, [activeCat]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catQuery = activeCat !== "all" ? `?cat=${activeCat}` : "";
      const [imgRes, catRes] = await Promise.all([
        fetch(`/api/gallery${catQuery}`),
        fetch("/api/categories")
      ]);
      
      const imgData = await imgRes.json();
      const catData = await catRes.json();
      
      setItems(imgData);
      setCategories(catData);
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: index + 1
    });
  };

  return (
    <div className="p-8 font-['Yanone_Kaffeesatz'] bg-black min-h-screen">
      <h2 className="text-white text-4xl mb-8 uppercase tracking-widest">Gallery</h2>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Button 
          variant={activeCat === "all" ? "solid" : "bordered"}
          className="border-white text-white rounded-none uppercase px-6"
          onClick={() => setActiveCat("all")}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.category_id}
            variant={activeCat === cat.category_id ? "solid" : "bordered"}
            className="border-white text-white rounded-none uppercase px-6"
            onClick={() => setActiveCat(cat.category_id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="white" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center pt-20">
          <h1 className="text-white text-5xl mb-2 uppercase">Check Back Soon</h1>
          <p className="text-zinc-500 text-lg">New fresh frames coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="relative h-[250px] bg-zinc-900 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              {/* v6 Video vs Photo Logic */}
              {item.media_type === "video" ? (
                <div className="w-full h-full relative">
                  <video 
                    src={`/gallery/${item.filename}`} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                    muted
                    loop
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => e.currentTarget.pause()}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 p-1 rounded text-white text-[10px] uppercase">
                    Video
                  </div>
                </div>
              ) : (
                <img
                  src={`/gallery/thumb_${item.filename}`}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modern Lightbox - Handles both Images and Videos automatically */}
      <FsLightbox
        toggler={lightboxController.toggler}
        sources={items.map(item => `/gallery/${item.filename}`)}
        slide={lightboxController.slide}
        type={items[lightboxController.slide - 1]?.media_type === 'video' ? 'video' : 'image'}
      />
    </div>
  );
}