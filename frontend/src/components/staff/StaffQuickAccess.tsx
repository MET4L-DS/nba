import { BookOpen, UserPlus, ArrowRight } from "lucide-react";

type StaffPage = "courses" | "enrollments";

interface StaffQuickAccessProps {
	onNavigate: (page: StaffPage) => void;
}

export function StaffQuickAccess({ onNavigate }: StaffQuickAccessProps) {
	const quickAccessItems = [
		{
			id: "courses" as StaffPage,
			title: "View Courses",
			description: "Browse all department courses, syllabi, outcomes, and settings",
			icon: BookOpen,
			theme: "from-blue-500 via-indigo-500 to-transparent",
			iconColor: "text-blue-500 dark:text-blue-400",
			iconBg: "bg-blue-500/10 border-blue-500/20",
		},
		{
			id: "enrollments" as StaffPage,
			title: "Enroll Students",
			description: "Add students to courses via sleek drag-and-drop CSV or manual entry",
			icon: UserPlus,
			theme: "from-amber-500 via-orange-500 to-transparent",
			iconColor: "text-amber-500 dark:text-amber-400",
			iconBg: "bg-amber-500/10 border-amber-500/20",
		},
	];

	return (
		<div className="space-y-4">
			<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Quick Access Tasks
			</h4>
			<div className="grid gap-6 md:grid-cols-2">
				{quickAccessItems.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.id}
							onClick={() => onNavigate(item.id)}
							className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden cursor-pointer flex items-start gap-5 active:scale-[0.98]"
						>
							<div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${item.theme}`} />
							
							<div className={`p-4 rounded-xl border transition-all duration-300 group-hover:scale-110 shrink-0 ${item.iconBg}`}>
								<Icon className={`w-6 h-6 ${item.iconColor}`} />
							</div>
							
							<div className="flex-1 space-y-1">
								<h3 className="font-bold text-lg text-foreground flex items-center gap-2 group-hover:text-amber-500 transition-colors">
									{item.title}
									<ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-amber-500" />
								</h3>
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
