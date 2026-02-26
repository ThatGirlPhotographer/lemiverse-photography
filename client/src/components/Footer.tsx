import { Link } from "@heroui/react";
import { Facebook, Instagram } from "lucide-react";
import { useEffect } from "react";

interface Props {
  settings: {
    site_title?: string;
    facebook_link?: string;
    instagram_link?: string;
  };
}

export default function Footer({ settings }: Props) {
  // Trustpilot script logic
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <footer className="bg-black text-white py-12 px-4 mt-auto">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        
        <div className="font-bold text-lg tracking-widest uppercase">
          {settings.site_title || "Darkroom Photography"}
        </div>

        <div className="flex justify-center items-center gap-8">
          <Link 
            href={settings.facebook_link || "https://www.facebook.com"} 
            isExternal 
            className="text-white hover:opacity-70 transition-all hover:scale-110"
          >
            <Facebook size={32} />
          </Link>
          
          <Link 
            href={settings.instagram_link || "https://www.instagram.com"} 
            isExternal 
            className="text-white hover:opacity-70 transition-all hover:scale-110"
          >
            <Instagram size={32} />
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {settings.site_title || "Darkroom Photography"}. All rights reserved.
        </div>

        {/* TrustBox widget */}
        <div 
          className="trustpilot-widget w-full" 
          data-locale="en-US" 
          data-template-id="56278e9abfbbba0bdcd568bc" 
          data-businessunit-id="6935d8dcf444175f88990032" 
          data-style-height="52px" 
          data-style-width="100%"
        >
          <a href="https://www.trustpilot.com/review/photos.lemiverse.win" target="_blank" rel="noopener noreferrer">
            Trustpilot
          </a>
        </div>
      </div>
    </footer>
  );
}