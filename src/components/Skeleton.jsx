import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable Skeleton components for consistent loading states
 */

export const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded-md ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
    {/* Image Skeleton */}
    <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
    
    {/* Content Skeleton */}
    <div className="p-5 flex flex-col gap-3 flex-grow">
      <Skeleton className="h-6 w-3/4 mb-1" />
      <div className="flex items-end gap-2 mb-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl mt-auto" />
    </div>
    
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export const SkeletonList = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <SkeletonCard />
      </motion.div>
    ))}
  </div>
);
