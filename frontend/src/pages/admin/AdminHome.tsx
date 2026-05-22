import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import type { AdminStats } from "@/services/api";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StatsCards } from "@/components/admin/StatsCards";
import { QuickAccessCards } from "@/components/admin/QuickAccessCards";
import { AppHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function AdminHome() {
	const navigate = useNavigate();
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();
	const [stats, setStats] = useState<AdminStats>({
		totalUsers: 0,
		totalCourses: 0,
		totalStudents: 0,
		totalAssessments: 0,
	});
	const [statsLoading, setStatsLoading] = useState(true);

	useEffect(() => {
		apiService
			.getAdminStats()
			.then(setStats)
			.catch(() => toast.error("Failed to load stats"))
			.finally(() => setStatsLoading(false));
	}, []);

	const handleRefreshStats = async () => {
		setStatsLoading(true);
		try {
			const statsData = await apiService.getAdminStats({ bypassCache: true });
			setStats(statsData);
			toast.success("Stats refreshed");
		} catch {
			toast.error("Failed to refresh stats");
		} finally {
			setStatsLoading(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="Administrator Dashboard"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				onLogout={async () => {
					await apiService.logout();
					window.location.href = "/login";
				}}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				<div className="flex flex-wrap gap-4 items-center justify-between bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-2">
					<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-indigo-500/25 pointer-events-none"></div>
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent"></div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Overview
						</h1>
						<p className="text-xs font-semibold text-muted-foreground mt-1">
							System-wide metrics and administrative actions.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefreshStats}
						disabled={statsLoading}
						className="hidden sm:flex active:scale-95 duration-200 transition-all bg-background/60 shadow-sm border-muted/50 rounded-xl h-10 px-4"
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${statsLoading ? "animate-spin text-indigo-500" : "text-indigo-500"}`}
						/>
						Refresh
					</Button>
				</div>

				{statsLoading ? (
					<div className="flex items-center justify-center h-64">
						<RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
					</div>
				) : (
					<>
						<StatsCards
							stats={stats}
							isLoading={statsLoading}
						/>
						<div className="pt-2">
							<QuickAccessCards
								stats={stats}
								onNavChange={(nav) => navigate(`/dashboard/${nav}`)}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
