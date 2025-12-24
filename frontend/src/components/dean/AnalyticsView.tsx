import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	BarChart3,
	Building2,
	BookOpen,
	ClipboardList,
	GraduationCap,
	Users,
} from "lucide-react";
import type { DepartmentAnalytics } from "@/services/api";

interface AnalyticsViewProps {
	analytics: DepartmentAnalytics[];
	isLoading: boolean;
}

export function AnalyticsView({ analytics, isLoading }: AnalyticsViewProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	// Calculate totals
	const totals = analytics.reduce(
		(acc, dept) => ({
			courses: acc.courses + dept.total_courses,
			tests: acc.tests + dept.total_tests,
			students: acc.students + dept.total_students,
			enrollments: acc.enrollments + dept.total_enrollments,
		}),
		{ courses: 0, tests: 0, students: 0, enrollments: 0 }
	);

	// Sort by total courses (descending)
	const sortedAnalytics = [...analytics].sort(
		(a, b) => b.total_courses - a.total_courses
	);

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
								<BookOpen className="w-6 h-6 text-emerald-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{totals.courses}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Courses
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
								<ClipboardList className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{totals.tests}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Tests
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
								<GraduationCap className="w-6 h-6 text-orange-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{totals.students}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Students
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
								<Users className="w-6 h-6 text-purple-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{totals.enrollments}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Enrollments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Department Analytics Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="w-5 h-5" />
						Department-wise Analytics
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Department</TableHead>
									<TableHead className="text-center">
										<BookOpen className="w-4 h-4 inline mr-1" />
										Courses
									</TableHead>
									<TableHead className="text-center">
										<ClipboardList className="w-4 h-4 inline mr-1" />
										Tests
									</TableHead>
									<TableHead className="text-center">
										<GraduationCap className="w-4 h-4 inline mr-1" />
										Students
									</TableHead>
									<TableHead className="text-center">
										<Users className="w-4 h-4 inline mr-1" />
										Enrollments
									</TableHead>
									<TableHead className="text-center">
										Avg Enrollment/Course
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedAnalytics.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="text-center py-8 text-muted-foreground"
										>
											No analytics data available
										</TableCell>
									</TableRow>
								) : (
									<>
										{sortedAnalytics.map((dept) => (
											<TableRow key={dept.department_id}>
												<TableCell>
													<div className="flex items-center gap-2">
														<Building2 className="w-4 h-4 text-purple-500" />
														<div>
															<Badge
																variant="outline"
																className="font-mono"
															>
																{
																	dept.department_code
																}
															</Badge>
															<p className="text-xs text-muted-foreground mt-1">
																{
																	dept.department_name
																}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant="secondary"
														className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
													>
														{dept.total_courses}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant="secondary"
														className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
													>
														{dept.total_tests}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant="secondary"
														className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
													>
														{dept.total_students}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant="secondary"
														className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
													>
														{dept.total_enrollments}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<span className="font-medium">
														{dept.total_courses > 0
															? (
																	dept.total_enrollments /
																	dept.total_courses
															  ).toFixed(1)
															: "0"}
													</span>
												</TableCell>
											</TableRow>
										))}
										{/* Totals Row */}
										<TableRow className="bg-gray-50 dark:bg-gray-800/50 font-semibold">
											<TableCell>
												<span className="text-gray-700 dark:text-gray-300">
													TOTAL ({analytics.length}{" "}
													Departments)
												</span>
											</TableCell>
											<TableCell className="text-center">
												{totals.courses}
											</TableCell>
											<TableCell className="text-center">
												{totals.tests}
											</TableCell>
											<TableCell className="text-center">
												{totals.students}
											</TableCell>
											<TableCell className="text-center">
												{totals.enrollments}
											</TableCell>
											<TableCell className="text-center">
												{totals.courses > 0
													? (
															totals.enrollments /
															totals.courses
													  ).toFixed(1)
													: "0"}
											</TableCell>
										</TableRow>
									</>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Visual Analytics - Bar representation */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="w-5 h-5" />
						Courses Distribution by Department
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{sortedAnalytics.map((dept) => {
							const maxCourses = Math.max(
								...analytics.map((d) => d.total_courses),
								1
							);
							const percentage =
								(dept.total_courses / maxCourses) * 100;

							return (
								<div
									key={dept.department_id}
									className="space-y-2"
								>
									<div className="flex justify-between text-sm">
										<span className="font-medium">
											{dept.department_code}
										</span>
										<span className="text-muted-foreground">
											{dept.total_courses} courses
										</span>
									</div>
									<div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
											style={{ width: `${percentage}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
