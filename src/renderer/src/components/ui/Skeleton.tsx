import React from 'react'
import clsx from 'clsx'
import './Skeleton.css'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  circle?: boolean
  className?: string
}

export function Skeleton({ width, height, circle = false, className }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div
      className={clsx('skeleton', circle && 'skeleton--circle', className)}
      style={style}
    />
  )
}
