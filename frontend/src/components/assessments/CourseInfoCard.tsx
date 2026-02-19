import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/services/api";

interface CourseInfoCardProps {
	course: Course;
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Course Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="flex justify-between">
					<span className="text-sm text-gray-500">Course Code</span>
					<span className="font-medium">{course.course_code}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-gray-500">Course Name</span>
					<span className="font-medium">{course.course_name}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-gray-500">Semester</span>
					<span className="font-medium">{course.semester}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-gray-500">Year</span>
					<span className="font-medium">{course.year}</span>
				</div>
			</CardContent>
		</Card>
	);
}
