import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout";
import { StaffStatsCards } from "@/components/staff/StaffStatsCards";
import { StaffQuickAccess } from "@/components/staff/StaffQuickAccess";
import { staffApi } from "@/services/api";
import type { StaffStats } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function StaffHome() {
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const [stats, setStats] = useState<StaffStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const navigate = useNavigate();

	useEffect(() => {
		const loadStats = async () => {
			try {
				const statsData = await staffApi.getStats();
				setStats(statsData);
			} catch (error) {
				toast.error("Failed to load dashboard data");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		loadStats();
	}, []);

	const handleItemClick = (id: "courses" | "enrollments") => {
		if (id === "enrollments") navigate("/staff/programmes");
		if (id === "courses") navigate("/staff/courses");
	};

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="Staff Dashboard"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<Loader2 className="h-8 w-8 animate-spin text-amber-500" />
					</div>
				) : (
					<>
						{stats && (
							<StaffStatsCards
								stats={stats}
								isLoading={isLoading}
							/>
						)}
						<div className="pt-2">
							<StaffQuickAccess onNavigate={handleItemClick} />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
