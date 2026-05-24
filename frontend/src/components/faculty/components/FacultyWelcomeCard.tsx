import { memo } from "react";
import type { User, Course } from "@/services/api";

interface FacultyWelcomeCardProps {
	user: User;
	selectedCourse: Course | null;
}

export const FacultyWelcomeCard = memo(function FacultyWelcomeCard({
	user,
	selectedCourse,
}: FacultyWelcomeCardProps) {
	return (
		<div className="flex flex-wrap gap-4 items-center justify-between bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-5 shadow-sm relative overflow-hidden mb-2">
			<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-primary/20 pointer-events-none"></div>
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
					Welcome, {user.username}
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{selectedCourse
						? `Currently managing ${selectedCourse.course_code} — ${selectedCourse.course_name}`
						: "Overview of your assigned courses and student performance."}
				</p>
			</div>
		</div>
	);
});
