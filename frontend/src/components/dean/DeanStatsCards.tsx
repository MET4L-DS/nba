import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid, StatsGridSkeleton, type StatItem } from "@/features/shared";
import {
	Building2,
	Users,
	BookOpen,
	GraduationCap,
	ClipboardList,
	UserCheck,
} from "lucide-react";
import type { DeanStats } from "@/services/api";

interface DeanStatsCardsProps {
	stats: DeanStats;
	isLoading?: boolean;
}

export function DeanStatsCards({ stats, isLoading }: DeanStatsCardsProps) {
	if (isLoading) {
		return <StatsGridSkeleton count={5} />;
	}

	const statItems: StatItem[] = [
		{
			label: "Departments",
			value: stats.totalDepartments,
			icon: Building2,
			color: "text-purple-500",
			bgColor: "bg-purple-50 dark:bg-purple-950",
		},
		{
			label: "Total Users",
			value: stats.totalUsers,
			icon: Users,
			color: "text-blue-500",
			bgColor: "bg-blue-50 dark:bg-blue-950",
		},
		{
			label: "Total Courses",
			value: stats.totalCourses,
			icon: BookOpen,
			color: "text-emerald-500",
			bgColor: "bg-emerald-50 dark:bg-emerald-950",
		},
		{
			label: "Total Students",
			value: stats.totalStudents,
			icon: GraduationCap,
			color: "text-orange-500",
			bgColor: "bg-orange-50 dark:bg-orange-950",
		},
		{
			label: "Assessments",
			value: stats.totalAssessments,
			icon: ClipboardList,
			color: "text-pink-500",
			bgColor: "bg-pink-50 dark:bg-pink-950",
		},
	];

	return (
		<div className="space-y-6">
			<StatsGrid stats={statItems} variant="outline" columns={5} />

			{/* Users by Role Card */}
			<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-teal-500 to-transparent"></div>
				<CardHeader className="pb-4 border-b bg-muted/[.06] pt-5">
					<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
						<div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
							<UserCheck className="w-4 h-4" />
						</div>
						Users by Role
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="grid gap-6 md:grid-cols-3">
						<div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
							<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
								<Users className="w-5 h-5" />
							</div>
							<div>
								<p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
									{stats.usersByRole?.hod || 0}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									HODs
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
							<div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
								<Users className="w-5 h-5" />
							</div>
							<div>
								<p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
									{stats.usersByRole?.faculty || 0}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Faculty
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
							<div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400">
								<Users className="w-5 h-5" />
							</div>
							<div>
								<p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
									{stats.usersByRole?.staff || 0}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Staff
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
