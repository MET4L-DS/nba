import type { Course } from "@/services/api";

interface CourseInfoDisplayProps {
	course: Course;
}

export function CourseInfoDisplay({ course }: CourseInfoDisplayProps) {
	return (
		<div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
			<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
				Course: {course.course_code} - {course.course_name}
			</p>
			<p className="text-xs text-blue-700 dark:text-blue-300">
				{course.semester} Semester, Year {course.year}
			</p>
		</div>
	);
}
