import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import type { HODStats } from "@/services/api";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
	StatsGrid,
	QuickAccessGrid,
} from "@/features/shared";
import { createHODStats } from "@/features/shared/statsFactory";
import { createHODQuickAccess } from "@/features/shared/quickAccessFactory";
import { AppHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { debugLogger } from "@/lib/debugLogger";

export function HODHome() {
	const navigate = useNavigate();
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();
	const [stats, setStats] = useState<HODStats>({
		totalFaculty: 0,
		totalCourses: 0,
		totalStudents: 0,
		totalAssessments: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		debugLogger.info("HODHome", "Component mounted");
		loadStats();
	}, []);

	const loadStats = async () => {
		debugLogger.info("HODHome", "loadStats starting");
		setIsLoading(true);
		try {
			const statsData = await apiService.getHODStats();
			setStats(statsData);
		} catch (error) {
			debugLogger.error("HODHome", "loadStats failed", error);
			console.error("Failed to load HOD stats:", error);
			toast.error("Failed to load statistics");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="HOD Dashboard"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				onLogout={async () => {
					await apiService.logout();
					window.location.href = "/login";
				}}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				<div className="flex flex-wrap gap-4 items-center justify-between bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-5 shadow-sm relative overflow-hidden mb-2">
					<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-primary/20 pointer-events-none"></div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Department Overview
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Manage your department's faculty, students, and courses from an integrated analytics center.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={loadStats}
						disabled={isLoading}
						className="hidden sm:flex h-9 text-xs font-semibold hover:bg-primary/[0.04] hover:text-primary transition-all duration-200"
					>
						<RefreshCw
							className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				</div>

				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-64 bg-card/40 border border-muted/30 rounded-xl backdrop-blur-sm shadow-sm gap-3">
						<div className="relative flex items-center justify-center">
							<div className="absolute w-12 h-12 rounded-full border-4 border-primary/20 animate-pulse"></div>
							<RefreshCw className="w-8 h-8 animate-spin text-primary relative z-10" />
						</div>
						<p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading department metrics...</p>
					</div>
				) : (
					<>
						<StatsGrid
							stats={createHODStats(stats)}
							isLoading={isLoading}
							variant="solid"
							columns={4}
						/>
						<QuickAccessGrid
							items={createHODQuickAccess()}
							onItemClick={(nav) => navigate(`/hod/${nav}`)}
							variant="elevated"
							columns={4}
						/>
					</>
				)}
			</div>
		</div>
	);
}
