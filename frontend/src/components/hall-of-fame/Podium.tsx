import { motion } from "framer-motion";
import { TopContributorCard } from "./TopContributorCard";
import type { Contributor } from "./HallOfFameSection";

interface PodiumProps {
  top3: Contributor[];
  onUserClick: (user: Contributor) => void;
}

export function Podium({ top3, onUserClick }: PodiumProps) {
  // We rename internally to 'Top Three' layout style
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl mx-auto">
      {/* Rank 1 - Centered and Larger */}
      {rank1 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 20 }}
          className="w-full max-w-sm z-20"
          onClick={() => onUserClick(rank1)}
        >
          <TopContributorCard contributor={rank1} rank={1} />
        </motion.div>
      )}

      {/* Rank 2 & 3 - Side by side below Rank 1 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 w-full z-10">
        {rank2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring", stiffness: 80, damping: 20 }}
            className="w-full sm:w-[320px]"
            onClick={() => onUserClick(rank2)}
          >
            <TopContributorCard contributor={rank2} rank={2} />
          </motion.div>
        )}
        
        {rank3 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 80, damping: 20 }}
            className="w-full sm:w-[320px]"
            onClick={() => onUserClick(rank3)}
          >
            <TopContributorCard contributor={rank3} rank={3} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
