import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import MainLayout from './components/MainLayout';

// Import your new pages
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import Contact from './pages/Contact';

// Mock settings - later these will come from an API call to your backend
const settings = {
  site_title: "Lemiverse Photos",
  about_text: "Capturing moments through a cinematic lens.",
  contact_email: "hello@lemiverse.win"
};

function App() {
  // For now, we'll pass null for user. 
  // We will handle actual Auth when we build the Admin Dashboard.
  const user = null; 

  return (
    <HelmetProvider>
      <BrowserRouter>
        <MainLayout settings={settings} user={user}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact contactEmail={settings.contact_email} />} />
            
            {/* 404 Page Fallback */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <h1 className="text-6xl font-bold">404</h1>
                <p className="text-xl">Out of Frame: Page not found.</p>
              </div>
            } />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;