import { motion } from "framer-motion";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function FloatingButtons() {
  return (
    <div
      data-no-print="true"
      className="fixed bottom-10 right-6 lg:bottom-14 lg:right-8 xl:right-10 z-30 flex flex-col gap-3.5 no-print print:hidden"
    >
      <motion.a
        href="https://www.instagram.com/subash_studio/"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="w-12 h-12 rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[#E7E0D2] flex items-center justify-center text-[#1C1B19] hover:text-[#B38F4D] hover:border-[#B38F4D] transition-all duration-300"
      >
        <FaInstagram size={19} />
      </motion.a>
      <motion.a
        href="https://wa.me/+919345706609"
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
