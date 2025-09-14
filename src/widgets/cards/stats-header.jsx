import { getDefaultDepartment, statisticsCardsData } from "@/data"
import { StatisticsCard } from "."
import SimpleStatsCard from "./SimpleStatsCard"
import React, { useCallback, useMemo, useState, useEffect } from "react"
import { Typography } from "@material-tailwind/react"
import { dateBefore, formatDate } from "@/helpers/date"
import { countDayDuration } from "@/helpers/env"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/solid"
import { cacheable } from "@/helpers/cache"
import dashboardService from "@/services/dashboard"

export function StatsHeader({ ministry = getDefaultDepartment(), from = dateBefore(countDayDuration), to = formatDate() }) {
    const [statsData, setStatsData] = useState({});
    const [loading, setLoading] = useState({});

    // Load data for each card
    useEffect(() => {
        const loadStats = async () => {
            // Only clear cache if data is really old
            console.log('� StatsHeader: Loading statistics with optimized caching');
            
            for (const card of statisticsCardsData) {
                setLoading(prev => ({ ...prev, [card.title]: true }));
                
                try {
                    console.log(`📊 Loading ${card.title} for ministry: ${ministry}, period: ${from} to ${to}`);
                    
                    // Use cached data efficiently
                    const data = await card.getCount(ministry, from, to);
                    
                    console.log(`📈 ${card.title} raw response:`, data);
                    
                    // Handle different response structures
                    let value = 0;
                    if (typeof data === 'number') {
                        value = data;
                    } else if (data?.data !== undefined) {
                        value = data.data;
                    } else if (data?.total_count) {
                        value = typeof data.total_count === 'object' 
                            ? data.total_count.total_count 
                            : data.total_count;
                    }
                    
                    const finalValue = parseInt(value) || 0;
                    console.log(`✅ ${card.title} final value:`, finalValue);
                    
                    setStatsData(prev => ({ 
                        ...prev, 
                        [card.title]: finalValue 
                    }));
                } catch (error) {
                    console.error(`❌ Error loading ${card.title}:`, error);
                    setStatsData(prev => ({ ...prev, [card.title]: 0 }));
                } finally {
                    setLoading(prev => ({ ...prev, [card.title]: false }));
                }
            }
        };

        loadStats();
    }, [ministry, from, to]);

    return (
        <div className="mb-8">
            {/* Simple Grid Layout */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statisticsCardsData.map((card, index) => (
                    <SimpleStatsCard
                        key={card.title}
                        color={card.color}
                        icon={card.icon}
                        title={card.title}
                        value={statsData[card.title]}
                        suffix={card.suffix || ""}
                        tooltip={card.tooltip}
                        loading={loading[card.title]}
                    />
                ))}
            </div>
        </div>
    )
}