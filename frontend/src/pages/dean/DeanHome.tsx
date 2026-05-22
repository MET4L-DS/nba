import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppHeader } from "@/components/layout";
import { apiService } from "@/services/api";
import type { DeanStats } from "@/services/api";
import { toast } from "sonner";
import { Loader2, UserCheck, Users } from "lucide-react";
import { StatsGrid } from "@/features/shared";
import { createDeanStats } from "@/features/shared/statsFactory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeanHome() {
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const [stats, setStats] = useState<DeanStats>({
		totalDepartments: 0,
		totalUsers: 0,
		totalCourses: 0,
		totalStudents: 0,
		totalAssessments: 0,
		usersByRole: { hod: 0, faculty: 0, staff: 0 },
	});
	const [statsLoading, setStatsLoading] = useState(true);

	useEffect(() => {
		apiService
			.getDeanStats()
			.then((statsData) => {
				setStats(statsData);
			})
			.catch(() => toast.error("Failed to load stats"))
			.finally(() => setStatsLoading(false));
	}, []);

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="Dean Dashboard"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				<div className="flex flex-wrap gap-4 items-center justify-between bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-5 shadow-sm relative overflow-hidden mb-2">
					<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-blue-500/20 pointer-events-none"></div>
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-teal-500 to-transparent"></div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Welcome, Dean
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Overview of your school's academic departments, faculties, and student enrollment metrics.
						</p>
					</div>
				</div>

				{statsLoading ? (
					<div className="flex items-center justify-center h-48">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					</div>
				) : (
					<>
						<StatsGrid
							stats={createDeanStats(stats)}
							isLoading={statsLoading}
							variant="outline"
							columns={5}
						/>

						{/* Users by Role Breakdown */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
								<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
										<div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
											<Users className="h-4 w-4" />
										</div>
										Faculty
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
										{stats?.usersByRole?.faculty || 0}
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
								<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-blue-300"></div>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
										<div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform duration-200">
											<UserCheck className="h-4 w-4" />
										</div>
										Staff
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
										{stats?.usersByRole?.staff || 0}
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
								<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 to-orange-300"></div>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
										<div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20 group-hover:scale-105 transition-transform duration-200">
											<Users className="h-4 w-4" />
										</div>
										Students
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">
										{stats?.totalStudents || 0}
									</div>
								</CardContent>
							</Card>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
