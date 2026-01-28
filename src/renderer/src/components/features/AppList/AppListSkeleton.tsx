import React from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '../../ui/Skeleton'
import './AppListSkeleton.css'

interface AppListSkeletonProps {
  count?: number
}

export function AppListSkeleton({ count = 5 }: AppListSkeletonProps) {
  return (
    <motion.div
      className="app-list-skeleton"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="app-list-skeleton__item"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <Skeleton width={48} height={48} circle />
          <div className="app-list-skeleton__info">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={14} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
