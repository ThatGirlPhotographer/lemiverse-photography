import { useEffect, useState } from "react";
import { Spinner, Button } from "@heroui/react";
import { Link } from "react-router-dom";

interface Service {
  id: number;
  title: string;
  price: string;
  sale_price?: string;
  is_on_sale: number | boolean;
  description: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Theme Mapping Logic
  const getTheme = (index: number) => {
    const themes = [
      {
        gradient: "from-[#c96881] to-[#f7b695]",
        iconColor: "fe5e7d",
        headerImg: "http://www.pixeden.com/media/k2/galleries/343/002-city-vector-background-town-vol2.jpg",
      },
      {
        gradient: "from-[#6B6ECC] to-[#89BFDF]",
        iconColor: "6B6ECC",
        headerImg: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
      },
      {
        gradient: "from-[#81B77B] to-[#A3E3C3]",
        iconColor: "81B77B",
        headerImg: "https://c7.uihere.com/files/859/510/385/abstract-forest-landscape.jpg",
      },
    ];
    return themes[index % 3];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Spinner color="white" size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-[80vh] py-12 px-5 font-['Yanone_Kaffeesatz']">
      <div className="flex flex-wrap justify-center items-center gap-8 max-w-7xl mx-auto">
        {services.length === 0 ? (
          <div className="text-center">
            <h1 className="text-white text-5xl mb-5 uppercase">No Services Available</h1>
            <p className="text-zinc-500 text-lg">Please check back soon for our latest packages.</p>
          </div>
        ) : (
          services.map((service, index) => {
            const theme = getTheme(index);
            return (
              <section
                key={service.id}
                className={`relative w-[290px] h-[340px] text-center bg-gradient-to-br ${theme.gradient} 
                rounded-[14px] shadow-2xl opacity-80 hover:opacity-100 hover:-translate-y-1.5 
                transition-all duration-300 cursor-pointer group animate-appearance-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon Circle */}
                <div className="absolute top-[60px] left-0 right-0 mx-auto w-20 h-20 bg-[#F1F0ED] z-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <img
                    src={`https://img.icons8.com/ios-filled/100/${theme.iconColor}/camera--v1.png`}
                    className="h-10 w-10"
                    alt="icon"
                  />
                </div>

                {/* Header Image Section */}
                <div className="h-[100px] w-full rounded-t-[14px] overflow-hidden">
                  <img
                    src={theme.headerImg}
                    className="w-[120%] max-w-none relative -top-5 left-0 group-hover:-left-12 transition-all duration-[3400ms] linear"
                    alt="header"
                  />
                </div>

                {/* Content */}
                <div className="p-4 pt-12">
                  <h3 className="font-extrabold uppercase text-white/60 text-xl tracking-wider leading-none mb-4">
                    {service.title}
                  </h3>

                  <div className="flex justify-center items-baseline gap-2 mb-2 h-14">
                    {service.is_on_sale && service.sale_price ? (
                      <>
                        <span className="text-white/50 line-through text-xl font-light">
                          {service.price}
                        </span>
                        <span className="text-white font-extrabold text-5xl drop-shadow-md">
                          {service.sale_price}
                        </span>
                      </>
                    ) : (
                      <span className="text-white font-extrabold text-5xl drop-shadow-md">
                        {service.price}
                      </span>
                    )}
                  </div>

                  <p className="text-white/90 font-light text-sm leading-tight line-clamp-3 mt-2">
                    {service.description}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="absolute -bottom-5 left-0 right-0 mx-auto w-[180px]">
                  <Button
                    as={Link}
                    to="/contact"
                    className="w-full bg-gradient-to-r from-[#fe5e7d] to-[#e5375b] text-white text-lg rounded-md shadow-[0px_0px_40px_4px_#F76583] group-hover:shadow-[0px_0px_60px_8px_#F76583] group-hover:scale-105 transition-all"
                  >
                    Book Now
                  </Button>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}