import { motion } from "framer-motion";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function FloatingButtons({ introActive = false }) {
  const { websiteContent } = useAdminData();
  const contactData = websiteContent?.contact || {};
  const instagramHref = contactData.instagram || "https://www.instagram.com/subash_studio/";
  const whatsappRaw = contactData.whatsapp || "+91 93457 06609";
  const whatsappHref = whatsappRaw.startsWith("http") ? whatsappRaw : `https://wa.me/${whatsappRaw.replace(/\D/g, "")}`;

  if (introActive) return null;

  return (
    <div
      data-no-print="true"
      className="fixed bottom-10 right-6 lg:bottom-14 lg:right-8 xl:right-10 z-30 flex flex-col gap-3.5 no-print print:hidden"
    >
      <motion.a
        href={instagramHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="w-12 h-12 rounded-full shadow-[0_6px_20px_rgba(214,36,159,0.35)] flex items-center justify-center text-white hover:brightness-110 transition-all duration-300"
        style={{
          background:
            "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        }}
      >
        <FaInstagram size={20} />
      </motion.a>
      <motion.a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full bg-[#25D366] shadow-[0_6px_20px_rgba(37,211,102,0.35)] flex items-center justify-center text-white hover:brightness-105 transition-all duration-300"
      >
        <FaWhatsapp size={20} />
      </motion.a>
    </div>
  );
}
