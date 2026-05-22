import { Users, BookOpen, GraduationCap, ClipboardList } from "lucide-react";
import type { AdminStats } from "@/services/api";

interface StatsCardsProps {
	stats: AdminStats;
	isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
	if (isLoading) {
		return (
			<div className="grid gap-6 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="bg-card/40 backdrop-blur-md border border-muted/30 rounded-2xl p-6 h-[120px] relative overflow-hidden animate-pulse"
					>
						<div className="absolute top-0 left-0 right-0 h-[3px] bg-muted/20" />
						<div className="flex items-center justify-between">
							<div className="space-y-3 flex-1">
								<div className="h-4 bg-muted/50 rounded-md w-2/3" />
								<div className="h-8 bg-muted/50 rounded-md w-1/3" />
							</div>
							<div className="h-12 w-12 rounded-xl bg-muted/50" />
						</div>
					</div>
				))}
			</div>
		);
	}

	const statItems = [
		{
			label: "Total Users",
			value: stats.totalUsers,
			icon: Users,
			theme: "from-indigo-500 via-purple-500 to-transparent",
			iconColor: "text-indigo-500 dark:text-indigo-400",
			iconBg: "bg-indigo-500/10 border-indigo-500/20",
		},
		{
			label: "Total Courses",
			value: stats.totalCourses,
			icon: BookOpen,
			theme: "from-blue-500 via-cyan-500 to-transparent",
			iconColor: "text-blue-500 dark:text-blue-400",
			iconBg: "bg-blue-500/10 border-blue-500/20",
		},
		{
			label: "Total Students",
			value: stats.totalStudents,
			icon: GraduationCap,
			theme: "from-emerald-500 via-teal-500 to-transparent",
			iconColor: "text-emerald-500 dark:text-emerald-400",
			iconBg: "bg-emerald-500/10 border-emerald-500/20",
		},
		{
			label: "Assessments",
			value: stats.totalAssessments,
			icon: ClipboardList,
			theme: "from-rose-500 via-orange-500 to-transparent",
			iconColor: "text-rose-500 dark:text-rose-400",
			iconBg: "bg-rose-500/10 border-rose-500/20",
		},
	];

	return (
		<div className="grid gap-6 md:grid-cols-4">
			{statItems.map((item, idx) => {
				const Icon = item.icon;
				return (
					<div
						key={idx}
						className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
					>
						<div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${item.theme}`} />
						
						<div className="flex items-center justify-between relative z-10">
							<div className="space-y-1">
								<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
									{item.label}
								</p>
								<h3 className="text-3xl font-extrabold tracking-tight text-foreground transition-transform duration-300 group-hover:scale-105 origin-left">
									{item.value}
								</h3>
							</div>
							<div className={`p-3 rounded-xl border transition-all duration-300 group-hover:scale-110 ${item.iconBg}`}>
								<Icon className={`w-6 h-6 ${item.iconColor}`} />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
