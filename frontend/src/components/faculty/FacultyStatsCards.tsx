import { memo, useMemo } from "react";
import { StatsGrid } from "@/features/shared";
import type { FacultyStats } from "@/services/api";
import { STAT_ITEMS_TEMPLATES } from "./constants";

interface FacultyStatsCardsProps {
	stats: FacultyStats;
	isLoading: boolean;
}

export const FacultyStatsCards = memo(function FacultyStatsCards({
	stats,
	isLoading,
}: FacultyStatsCardsProps) {
	const statItems = useMemo(() => {
		return STAT_ITEMS_TEMPLATES.map((item) => ({
			label: item.label,
			value: stats[item.key] ?? 0,
			suffix: item.suffix,
			icon: item.icon,
			gradient: item.gradient,
			bgGradient: item.bgGradient,
		}));
	}, [stats]);

	return (
		<StatsGrid
			stats={statItems}
			isLoading={isLoading}
			variant="solid"
			columns={4}
		/>
	);
});
