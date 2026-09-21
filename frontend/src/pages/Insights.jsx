import React, { useEffect, useState } from 'react'
import InsightsHeader from '../components/insights/InsightsHeader'
import InsightsMetricCards from '../components/insights/InsightsMetricCards'
import RegulatoryChangesTrend from '../components/insights/RegulatoryChangesTrend'
import ChangeTypeDistribution from '../components/insights/ChangeTypeDistribution'
import AIRegulatoryBrief from '../components/insights/AIRegulatoryBrief'
import ComplianceRiskAreas from '../components/insights/ComplianceRiskAreas'
import PolicyImpactAreas from '../components/insights/PolicyImpactAreas'
import RecentHighImpactChanges from '../components/insights/RecentHighImpactChanges'
import RegulatoryThemes from '../components/insights/RegulatoryThemes'
import RegulatorCoverage from '../components/insights/RegulatorCoverage'
import MonitoringCard from '../components/insights/MonitoringCard'
import InsightsEmptyState from '../components/insights/InsightsEmptyState'
import { getGlobalInsights } from '../services/insightsApi'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Insights() {
  const [timeRange, setTimeRange] = useState('12m')
  const [granularity, setGranularity] = useState('monthly')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInsights = async (range = timeRange, gran = granularity, refreshAi = false) => {
    try {
      setLoading(true)
      setError(null)
      const res = await getGlobalInsights(range, gran, refreshAi)
      setData(res)
    } catch (err) {
      console.error('[Insights Page Error]', err)
      setError(err.message || 'Failed to fetch global regulatory insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights(timeRange, granularity)
  }, [timeRange, granularity])

  const handleRefresh = () => {
    fetchInsights(timeRange, granularity, true)
  }

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#112117] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1520px] mx-auto space-y-6">
        {/* Header */}
        <InsightsHeader
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#F87171]/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-[#B91C1C]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={() => fetchInsights()}
              className="px-3 py-1.5 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-[#EEF3EC] rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 h-72 bg-[#EEF3EC] rounded-2xl" />
              <div className="lg:col-span-3 h-72 bg-[#EEF3EC] rounded-2xl" />
              <div className="lg:col-span-4 h-72 bg-[#EEF3EC] rounded-2xl" />
            </div>
          </div>
        )}

        {/* Content View */}
        {data && (
          <>
            {!data.has_data ? (
              <InsightsEmptyState />
            ) : (
              <div className="space-y-5">
                {/* 1. Horizontal KPI Row */}
                <InsightsMetricCards kpis={data.kpis} />

                {/* 2. Top Analytics Grid: Trend + Distribution + AI Brief (Balanced 3-column layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4.5 items-stretch">
                  <div className="h-full">
                    <RegulatoryChangesTrend
                      trendData={data.changes_trend}
                      granularity={granularity}
                      onGranularityChange={setGranularity}
                    />
                  </div>
                  <div className="h-full">
                    <ChangeTypeDistribution distribution={data.change_distribution} />
                  </div>
                  <div className="h-full">
                    <AIRegulatoryBrief
                      aiBrief={data.ai_brief}
                      onRefresh={handleRefresh}
                      refreshing={loading}
                    />
                  </div>
                </div>

                {/* 3. Middle Risk & Policy Grid: Risk Areas + Policy Areas + Recent Changes */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-stretch">
                  <div className="lg:col-span-4">
                    <ComplianceRiskAreas riskAreas={data.top_risk_areas} />
                  </div>
                  <div className="lg:col-span-4">
                    <PolicyImpactAreas policyAreas={data.frequently_affected_policy_areas} />
                  </div>
                  <div className="lg:col-span-4">
                    <RecentHighImpactChanges recentChanges={data.recent_high_impact_changes} />
                  </div>
                </div>

                {/* 4. Bottom Grid: NLP Themes + Regulator Coverage + Future Monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-stretch">
                  <div className="lg:col-span-4">
                    <RegulatoryThemes themes={data.regulatory_themes} />
                  </div>
                  <div className="lg:col-span-4">
                    <RegulatorCoverage coverage={data.regulator_coverage} />
                  </div>
                  <div className="lg:col-span-4">
                    <MonitoringCard />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
