import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function EntryModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasEntered = localStorage.getItem("stuhub_entry_passed");
    if (!hasEntered) {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem("stuhub_entry_passed", "true");
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const handleExit = () => {
    // Redirect to a safe space or Google
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#111111] shadow-2xl flex flex-col items-center text-center rounded-sm overflow-hidden"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div className="w-full px-6 py-10 flex flex-col items-center">
              
              {/* Logo */}
              <div className="flex items-center justify-center text-4xl font-bold mb-6 tracking-tight">
                <span className="text-white">Stu</span>
                <span className="bg-[#FF9000] text-black px-1.5 rounded-sm ml-0.5 pb-0.5">hub</span>
              </div>

              {/* Title */}
              <h2 className="text-[28px] font-bold text-white mb-6">
                This is an adult website
              </h2>

              {/* Notice Button */}
              <button className="border border-[#FF9000] text-[#FF9000] px-4 py-1.5 rounded-sm text-sm font-semibold mb-6 hover:bg-[#FF9000]/10 transition-colors">
                Notice to Users
              </button>

              {/* Body Text */}
              <p className="text-[#E0E0E0] text-base leading-relaxed mb-4 px-2">
                This website contains age-restricted materials. By entering, you affirm that you are at least 18 years of age you are accessing the website from and you consent to viewing educational explicit content.
              </p>

              {/* Notice Link */}
              <a href="#" className="text-[#FF9000] font-bold text-sm mb-8 hover:underline">
                Notice to Law Enforcement
              </a>

              {/* Action Buttons */}
              <div className="w-full space-y-4 px-4 mb-8">
                <button
                  onClick={handleEnter}
                  className="w-full border-2 border-[#FF9000] rounded-sm py-3.5 text-white font-bold text-lg hover:bg-[#FF9000]/10 transition-colors"
                >
                  I am 18 or older - Enter
                </button>
                
                <button
                  onClick={handleExit}
                  className="w-full border-2 border-[#FF9000] rounded-sm py-3.5 text-white font-bold text-lg hover:bg-[#FF9000]/10 transition-colors"
                >
                  I am under 18 - Exit
                </button>
              </div>

              {/* Footer Text */}
              <div className="text-[#B0B0B0] text-[13px] leading-relaxed">
                Our <a href="#" className="text-[#FF9000] font-bold hover:underline">parental controls page</a> explains<br />
                how you can easily block access to this site.<br />
                <a href="#" className="text-[#FF9000] font-bold hover:underline mt-1 inline-block">Terms of Service</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
