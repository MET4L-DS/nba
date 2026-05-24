import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { Course } from "@/services/api";
import { CoursesTableArea } from "./CoursesTableArea";

interface AssignedCoursesCardProps {
	courses: Course[];
	isLoading: boolean;
	onRefresh?: () => void;
}

export const AssignedCoursesCard = memo(function AssignedCoursesCard({
	courses,
	isLoading,
	onRefresh,
}: AssignedCoursesCardProps) {
	return (
		<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
			<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent"></div>
			<CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-muted/[.06] pt-6">
				<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
					<div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner text-blue-600 dark:text-blue-400">
						<BookOpen className="w-5 h-5" />
					</div>
					<div>
						<span>My Assigned Courses</span>
						<p className="text-xs text-muted-foreground mt-0.5 font-normal">
							Track current offerings and finalize past course mappings.
						</p>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6">
				<CoursesTableArea
					courses={courses}
					isLoading={isLoading}
					onRefresh={onRefresh}
				/>
			</CardContent>
		</Card>
	);
});
