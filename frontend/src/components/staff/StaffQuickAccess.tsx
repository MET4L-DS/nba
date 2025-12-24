import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, UserPlus } from "lucide-react";

type StaffPage = "courses" | "enrollments";

interface StaffQuickAccessProps {
	onNavigate: (page: StaffPage) => void;
}

export function StaffQuickAccess({ onNavigate }: StaffQuickAccessProps) {
	const quickAccessItems = [
		{
			title: "View Courses",
			description: "Browse all department courses and their details",
			icon: BookOpen,
			page: "courses" as StaffPage,
			gradient: "from-blue-500 to-indigo-600",
		},
		{
			title: "Enroll Students",
			description: "Add students to courses via CSV upload",
			icon: UserPlus,
			page: "enrollments" as StaffPage,
			gradient: "from-emerald-500 to-teal-600",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{quickAccessItems.map((item) => (
				<Card
					key={item.title}
					className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
					onClick={() => onNavigate(item.page)}
				>
					<CardHeader className="pb-2">
						<div
							className={`w-12 h-12 rounded-lg bg-linear-to-br ${item.gradient} flex items-center justify-center mb-3`}
						>
							<item.icon className="w-6 h-6 text-white" />
						</div>
						<CardTitle className="text-lg">{item.title}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{item.description}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
