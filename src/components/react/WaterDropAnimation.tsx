import { motion } from "motion/react";

export default function WaterDropAnimation() {
      return (
            <div className="relative w-8 aspect-square">
                  <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 0.8, 1.1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                        className="absolute top-1/2 left-1/2 -translate-1/2 w-8 aspect-square rounded-full bg-white/5 border border-(--primary-text-color)"
                  ></motion.div>
                  <div className="absolute top-1/2 left-1/2 -translate-1/2 w-4 aspect-square bg-(--primary-text-color) rounded-full"></div>
            </div>
      );
}
