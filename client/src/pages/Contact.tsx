import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface Props {
  contactEmail: string;
}

export default function Contact({ contactEmail }: Props) {
  // Accessing the env variable using Vite's syntax
  const SITE_KEY = import.meta.env.TURNSTILE_SITE_KEY;

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    message: "",
    token: "" // Cloudflare Turnstile Token
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.token) {
      alert("Please complete the security challenge.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", budget: "", message: "", token: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="bg-black text-white py-12 min-h-[80vh] font-['Lato',sans-serif]">
      <header className="text-center text-4xl tracking-[7px] font-light uppercase mt-5 mb-2">
        Get In Touch
      </header>
      
      <p className="text-center text-gray-400 text-sm tracking-wider mb-10 max-w-[600px] mx-auto px-5">
        Interested in working together? Fill out the form below. I'll get back to you as soon as possible!
      </p>

      {status === "success" && (
        <div className="max-w-[500px] mx-auto mb-5 text-center text-green-400 border border-green-400 p-2">
          Message sent successfully!
        </div>
      )}

      {status === "error" && (
        <div className="max-w-[500px] mx-auto mb-5 text-center text-red-400 border border-red-400 p-2">
          Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative w-[90%] max-w-[500px] mx-auto mb-12">
        {/* Name Input */}
        <input
          className="w-full h-[50px] bg-transparent border border-white p-4 text-sm outline-none transition-all hover:bg-zinc-900 focus:bg-zinc-900 rounded-t-md mb-[-1px] relative z-0 focus:z-10"
          placeholder="NAME"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {/* Email Input */}
        <input
          className="w-full h-[50px] bg-transparent border border-white p-4 text-sm outline-none transition-all hover:bg-zinc-900 focus:bg-zinc-900 mb-[-1px] relative z-0 focus:z-10"
          placeholder="E-MAIL"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* v6 NEW: Budget Input */}
        <input
          className="w-full h-[50px] bg-transparent border border-white p-4 text-sm outline-none transition-all hover:bg-zinc-900 focus:bg-zinc-900 mb-[-1px] relative z-0 focus:z-10"
          placeholder="BUDGET (e.g. £500)"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        />

        {/* Message Textarea */}
        <textarea
          className="w-full h-[110px] bg-transparent border border-white p-4 text-sm outline-none transition-all hover:bg-zinc-900 focus:bg-zinc-900 resize-none mb-[-1px] relative z-0 focus:z-10 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-black"
          placeholder="MESSAGE"
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />

        {/* Cloudflare Turnstile Security (v6) */}
        <div className="flex justify-center my-4">
          {/* Only render Turnstile if the key exists to prevent crashes */}
          {SITE_KEY ? (
            <Turnstile 
              siteKey={SITE_KEY} 
              onSuccess={(token) => setFormData({ ...formData, token })} 
              theme="dark"
            />
          ) : (
            <p className="text-red-500 text-xs">Turnstile Site Key missing from .env</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-transparent border border-white text-white font-bold tracking-[2px] transition-all hover:bg-white hover:text-black rounded-b-md uppercase"
        >
          GO!
        </button>
      </form>

      <div className="w-[90%] max-w-[500px] mx-auto border-t border-zinc-800 pt-8 text-center">
        <h3 className="text-xl font-light tracking-[2px] mb-2">Connect</h3>
        <p className="text-gray-400 text-sm">Email: {contactEmail}</p>
      </div>
    </div>
  );
}