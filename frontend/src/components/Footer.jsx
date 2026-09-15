import React from 'react'
import BrandMark from './BrandMark'

export default function Footer() {
  const productLinks = [
    { name: 'Product', href: '#product' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Use Cases', href: '#use-cases' },
    { name: 'About', href: '#about' },
  ]

  const resourceLinks = [
    { name: 'Documentation', href: '#documentation' },
    { name: 'Research', href: '#research' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <footer className="w-full bg-[#FAFBF9] border-t border-[#EAEFE8] pt-14 sm:pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-14 border-b border-[#EAEFE8]">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-4 flex flex-col items-start">
            <BrandMark />
          </div>

          {/* Col 2: Product Links */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-xs font-bold text-[#112117] uppercase tracking-wider mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-[13px] text-[#55665C] hover:text-[#112117] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Resources Links */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-xs font-bold text-[#112117] uppercase tracking-wider mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-[13px] text-[#55665C] hover:text-[#112117] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Editorial Statement Quote */}
          <div className="md:col-span-4 flex flex-col md:pl-6 md:border-l md:border-[#EAEFE8]">
            <p className="font-editorial italic text-base sm:text-lg text-[#2C4033] leading-snug mb-2">
              &ldquo;A more transparent regulatory future.&rdquo;
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-[1px] bg-[#2C634D]" />
              <span className="text-[10px] font-bold tracking-widest text-[#2C634D] uppercase">
                ReguLens
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A8C80]">
          <p>© 2026 ReguLens. All rights reserved.</p>
          <p className="font-medium text-[#5E7065]">Built for a more informed tomorrow.</p>
        </div>
      </div>
    </footer>
  )
}
