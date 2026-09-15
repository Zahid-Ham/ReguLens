import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import BrandMark from './BrandMark'
import PrimaryButton from './PrimaryButton'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('product')

  const navLinks = [
    { name: 'Product', id: 'product', href: '#product' },
    { name: 'How It Works', id: 'how-it-works', href: '#how-it-works' },
    { name: 'Use Cases', id: 'use-cases', href: '#use-cases' },
    { name: 'About', id: 'about', href: '#about' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60

      const sectionElements = navLinks
        .map((link) => ({
          id: link.id,
          element: document.getElementById(link.id),
        }))
        .filter((item) => item.element !== null)

      if (isBottom && sectionElements.length > 0) {
        setActiveSection(sectionElements[sectionElements.length - 1].id)
        return
      }

      const scrollPosition = window.scrollY + 130

      let current = navLinks[0].id
      for (let i = 0; i < sectionElements.length; i++) {
        const { id, element } = sectionElements[i]
        if (scrollPosition >= element.offsetTop) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, href, id) => {
    e.preventDefault()
    setActiveSection(id)
    setMobileMenuOpen(false)

    const targetElement = document.getElementById(id)
    if (targetElement) {
      const headerOffset = 80
      const elementPosition = targetElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      window.history.pushState(null, '', href)
    }
  }

  return (
    <header className="w-full bg-[#FAFBF9]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#EAEFE8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex-shrink-0">
          <BrandMark />
        </div>

        {/* Center/Right: Functional Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 ml-auto mr-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id

            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.id)}
                className={`text-[13.5px] transition-colors duration-150 relative py-1 group select-none cursor-pointer ${
                  isActive
                    ? 'text-[#112117] font-semibold'
                    : 'text-[#55665C] hover:text-[#112117] font-medium'
                }`}
              >
                {link.name}

                {/* Persistent Active Underline Indicator */}
                {isActive ? (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#132E22] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#2C634D]/50 transition-all duration-200 group-hover:w-full rounded-full" />
                )}
              </a>
            )
          })}
        </nav>

        {/* Right: Desktop CTA */}
        <div className="hidden md:flex items-center">
          <PrimaryButton
            variant="primary"
            icon="arrow"
            to="/analysis/new"
            className="py-2.5 px-5 text-sm"
          >
            Get Started
          </PrimaryButton>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#334238] hover:bg-[#EEF3EC] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[#EAEFE8] bg-[#FAFBF9] px-6 py-5 shadow-lg"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id

                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.id)}
                    className={`text-base py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#EBF5EE] text-[#132E22] font-bold border-l-4 border-[#132E22]'
                        : 'text-[#48594F] hover:bg-[#F2F6F0] hover:text-[#112117] font-medium'
                    }`}
                  >
                    {link.name}
                  </a>
                )
              })}
              <div className="pt-3 border-t border-[#EAEFE8] mt-1">
                <PrimaryButton
                  variant="primary"
                  icon="arrow"
                  to="/analysis/new"
                  className="w-full py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
