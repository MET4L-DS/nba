import { Users, BookOpen, GraduationCap, FileText, ArrowRight } from "lucide-react";
import type { AdminStats } from "@/services/api";

interface QuickAccessCardsProps {
	stats: AdminStats;
	onNavChange: (navId: string) => void;
}

export function QuickAccessCards({
	stats,
	onNavChange,
}: QuickAccessCardsProps) {
	const items = [
		{
			id: "users",
			title: "Manage Users",
			description: "View, create, edit, or remove system users and roles",
			icon: Users,
			value: `${stats.totalUsers} Users`,
			theme: "from-indigo-500 via-purple-500 to-transparent",
			iconColor: "text-indigo-500 dark:text-indigo-400",
			iconBg: "bg-indigo-500/10 border-indigo-500/20",
		},
		{
			id: "courses",
			title: "View Courses",
			description: "Browse and configure all department course curricula",
			icon: BookOpen,
			value: `${stats.totalCourses} Courses`,
			theme: "from-blue-500 via-cyan-500 to-transparent",
			iconColor: "text-blue-500 dark:text-blue-400",
			iconBg: "bg-blue-500/10 border-blue-500/20",
		},
		{
			id: "students",
			title: "View Students",
			description: "Browse student cohorts, rolls, and enrollments",
			icon: GraduationCap,
			value: `${stats.totalStudents} Students`,
			theme: "from-emerald-500 via-teal-500 to-transparent",
			iconColor: "text-emerald-500 dark:text-emerald-400",
			iconBg: "bg-emerald-500/10 border-emerald-500/20",
		},
		{
			id: "tests",
			title: "View Tests",
			description: "Browse all assessments, quizzes, and grade matrices",
			icon: FileText,
			value: `${stats.totalAssessments} Tests`,
			theme: "from-rose-500 via-orange-500 to-transparent",
			iconColor: "text-rose-500 dark:text-rose-400",
			iconBg: "bg-rose-500/10 border-rose-500/20",
		},
	];

	return (
		<div className="space-y-4">
			<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Administrative Actions
			</h4>
			<div className="grid gap-6 md:grid-cols-2">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.id}
							onClick={() => onNavChange(item.id)}
							className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden cursor-pointer flex items-start gap-5 active:scale-[0.98]"
						>
							<div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${item.theme}`} />
							
							<div className={`p-4 rounded-xl border transition-all duration-300 group-hover:scale-110 shrink-0 ${item.iconBg}`}>
								<Icon className={`w-6 h-6 ${item.iconColor}`} />
							</div>
							
							<div className="flex-1 space-y-1">
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-lg text-foreground flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
										{item.title}
										<ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-500" />
									</h3>
									<span className="text-xs font-bold px-2 py-1 rounded-md bg-muted/60 border border-muted text-muted-foreground shadow-sm">
										{item.value}
									</span>
								</div>
								<p className="text-sm font-medium text-muted-foreground leading-relaxed">
									{item.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
