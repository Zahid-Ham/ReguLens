import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import rbiFacadeImage from '../../assets/rbi_facade.jpg'

export default function ResultsHeader({
  previousDocName = 'RBI PSL Guidelines 2020',
  currentDocName = '2025',
}) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Top Back Navigation Link */}
      <div>
        <Link
          to="/analysis/new"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A5D51] hover:text-[#112117] transition-colors group select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#63756A] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Analysis Setup</span>
        </Link>
      </div>

      {/* Main Editorial Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Eyebrow + Main Title + Subtitle */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#2C634D]" />
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
              Analysis Results
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] text-[#112117] font-normal tracking-tight mb-3">
            Regulatory Change Intelligence
          </h1>
          <p className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-xl">
            Comparison analysis complete. Here are the key changes detected between {previousDocName} and {currentDocName}.
          </p>
        </div>

        {/* Right: Restrained Editorial Visual Banner */}
        <div className="lg:col-span-5 flex justify-end">
          <div className="relative w-full max-w-md bg-[#EDF4ED]/80 border border-[#DCE8DC] rounded-2xl p-5 overflow-hidden flex items-center justify-between shadow-2xs">
            {/* Blended Background Architectural Art */}
            <div className="absolute right-0 bottom-0 w-36 h-28 opacity-35 pointer-events-none select-none">
              <img
                src={rbiFacadeImage}
                alt="Regulatory Architectural Facade"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>

            {/* Editorial Content */}
            <div className="relative z-10 flex flex-col pr-4">
              <p className="font-editorial italic text-[15px] sm:text-[16px] text-[#132E22] leading-snug">
                &ldquo;Clearer changes. Stronger decisions.&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-3.5 h-[1px] bg-[#2C634D]" />
                <span className="text-[9.5px] font-bold tracking-widest text-[#2C634D] uppercase">
                  ReguLens
                </span>
              </div>
            </div>

            <div className="relative z-10 pl-3 border-l border-[#D2E2D1] hidden sm:flex flex-col text-right">
              <span className="font-editorial italic text-xs text-[#2C634D]">
                From regulatory change to
              </span>
              <span className="font-editorial italic text-xs text-[#132E22] font-semibold">
                real-world impact.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
