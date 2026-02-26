import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";

export default function MainLayout({ children, settings, user }: any) {
  const location = useLocation();
  
  // Check if we are on the Home page
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navigation siteTitle={settings.site_title} user={user} />
      
      {/* isHomePage ? "" -> No padding, Hero goes under Navbar
          : "pt-24"      -> Adds 96px of padding to push Gallery/Contact down
      */}
      <main className={`flex-grow ${isHomePage ? "" : "pt-32"}`}>
        {children}
      </main>

      <Footer settings={settings} />
    </div>
  );
}