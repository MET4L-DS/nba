import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, ClipboardList, TrendingUp } from "lucide-react";
import type { Course } from "@/services/api";
import { LoadingSpinner, EmptyState } from "@/components/shared";

interface FacultyOverviewProps {
	courses: Course[];
	isLoading: boolean;
}

export function FacultyOverview({ courses, isLoading }: FacultyOverviewProps) {
	if (isLoading) {
		return <LoadingSpinner size="lg" className="my-12" />;
	}

	if (courses.length === 0) {
		return (
			<EmptyState
				title="No Courses Assigned"
				description="You don't have any courses assigned yet. Contact your department HOD for course assignments."
				icon={BookOpen}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Course List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="w-5 h-5" />
						My Courses
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{courses.map((course) => (
							<div
								key={course.id}
								className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
							>
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="font-semibold text-lg">
											{course.course_code}
										</h3>
										<Badge variant="outline">
											{course.credit} Credits
										</Badge>
									</div>
									<p className="text-gray-600 dark:text-gray-400">
										{course.name}
									</p>
									<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
										<span className="flex items-center gap-1">
											<Users className="w-4 h-4" />
											Year {course.year}
										</span>
										<span>Semester {course.semester}</span>
									</div>
								</div>
								<div className="flex flex-col items-end gap-2">
									<Badge
										variant="secondary"
										className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										<ClipboardList className="w-3 h-3 mr-1" />
										Active
									</Badge>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Performance Insights */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5" />
						Performance Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Total Courses
							</p>
							<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{courses.length}
							</p>
						</div>
						<div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Active Semester
							</p>
							<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
								{courses.length > 0
									? `Sem ${Math.max(
											...courses.map((c) => c.semester)
									  )}`
									: "N/A"}
							</p>
						</div>
						<div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Total Credits
							</p>
							<p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
								{courses.reduce((sum, c) => sum + c.credit, 0)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
