import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

import { Link } from 'react-router-dom'

export default function PrimaryButton({
  children,
  variant = 'primary',
  icon = null,
  onClick,
  className = '',
  href,
  to,
  ...props
}) {
  const isPrimary = variant === 'primary'

  const baseStyles =
    'inline-flex items-center justify-center font-medium text-sm transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantStyles = isPrimary
    ? 'bg-[#132E22] hover:bg-[#0B1E16] active:bg-[#06120D] text-white px-6 py-3 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-md focus:ring-[#132E22]'
    : 'bg-white hover:bg-[#F3F6F1] active:bg-[#EAEFE8] text-[#132E22] border border-[#CCD6CC] hover:border-[#B2BEB2] px-6 py-3 rounded-lg focus:ring-[#132E22]'

  const content = (
    <motion.div
      className="flex items-center gap-2"
      whileHover="hover"
      initial="initial"
    >
      {icon === 'play' && (
        <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current flex-shrink-0">
          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
        </span>
      )}

      <span>{children}</span>

      {icon === 'arrow' && (
        <motion.span
          variants={{
            initial: { x: 0 },
            hover: { x: 3 },
          }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="flex items-center flex-shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      )}
    </motion.div>
  )

  if (to) {
    return (
      <Link to={to} className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {content}
    </button>
  )
}
