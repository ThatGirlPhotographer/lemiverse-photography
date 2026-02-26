import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Link } from "react-router-dom";

export default function Home() {
  const words = ["UNSEEN", "AUTHENTIC", "MOMENTS", "STORY", "EMOTIONS"];
  const [displayText, setDisplayText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter Effect Logic
  useEffect(() => {
    const currentFullWord = words[wordIdx];
    
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCharIdx((prev) => prev - 1);
      } else {
        setCharIdx((prev) => prev + 1);
      }
    }, isDeleting ? 70 : 150);

    if (!isDeleting && charIdx === currentFullWord.length) {
      setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % words.length);
    }

    setDisplayText(currentFullWord.substring(0, charIdx));

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, wordIdx]);

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden bg-black">
      {/* Background Wrapper with Fade Mask */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
        }}
      >
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center grayscale-[20%] brightness-[0.5]"
          style={{ backgroundImage: "url('http://www.pixeden.com/media/k2/galleries/343/002-city-vector-background-town-vol2.jpg')" }}
        />
      </div>

      {/* Hero Content */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center w-full px-5">
        <p className="text-[0.7rem] tracking-[0.4rem] text-[#c5a059] mb-2 uppercase">
          PORTFOLIO BY LEMI — 2026
        </p>
        
        <h1 className="text-[clamp(1.8rem,8vw,5rem)] font-extrabold text-white uppercase leading-none min-h-[1.8em]">
          CAPTURING THE <br />
          <span className="font-serif italic font-light text-[#c5a059]">
            {displayText || "\u00A0"}
          </span>
        </h1>

        <div className="mt-6">
          <Button
            as={Link}
            to="/gallery"
            variant="bordered"
            radius="none"
            className="border-white/40 text-white tracking-[0.15rem] text-[0.75rem] uppercase hover:bg-white hover:text-black transition-all px-8 h-12"
          >
            VIEW WORK
          </Button>
        </div>
      </div>
    </div>
  );
}