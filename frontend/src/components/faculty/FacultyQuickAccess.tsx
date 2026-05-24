import { memo } from "react";
import { QuickAccessGrid } from "@/features/shared";
import { QUICK_ACCESS_ITEMS } from "./constants";

type FacultyPage = "dashboard" | "assessments" | "marks" | "copo";

interface FacultyQuickAccessProps {
	onNavigate: (page: FacultyPage) => void;
}

export const FacultyQuickAccess = memo(function FacultyQuickAccess({
	onNavigate,
}: FacultyQuickAccessProps) {
	return (
		<QuickAccessGrid
			items={QUICK_ACCESS_ITEMS}
			onItemClick={(id) => onNavigate(id as FacultyPage)}
			variant="elevated"
			columns={3}
		/>
	);
});
