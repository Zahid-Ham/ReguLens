import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../sections/HeroSection'
import HowItWorksSection from '../sections/landing/HowItWorksSection'
import BlackBoxSection from '../sections/landing/BlackBoxSection'
import UseCasesSection from '../sections/landing/UseCasesSection'
import ImpactBand from '../sections/landing/ImpactBand'
import FinalCTA from '../sections/landing/FinalCTA'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#19221C] flex flex-col font-sans selection:bg-[#132E22] selection:text-white">
      {/* Top Header / Navigation */}
      <Navbar />

      {/* Main Landing Page Flow */}
      <main className="flex-1 flex flex-col">
        {/* Frame 1: Hero Section */}
        <HeroSection />

        {/* Section 1: The Process — How ReguLens Works (6-Stage NLP Workflow) */}
        <HowItWorksSection />

        {/* Section 2: Beyond a Black Box — NLP Pipeline in Action (Clause Analysis Preview) */}
        <BlackBoxSection />

        {/* Section 3: Real-World Impact — Built for Real Use Cases (4 Cards) */}
        <UseCasesSection />

        {/* Section 4: Brand Impact & 3 Core Benefits Band */}
        <ImpactBand />

        {/* Section 5: Get Started Final Conversion CTA & Document Visual */}
        <FinalCTA />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
