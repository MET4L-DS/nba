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
import { Building2, Users, BookOpen, GraduationCap } from "lucide-react";
import type { DeanDepartment } from "@/services/api";

interface DepartmentsViewProps {
	departments: DeanDepartment[];
	isLoading: boolean;
}

export function DepartmentsView({
	departments,
	isLoading,
}: DepartmentsViewProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
								<Building2 className="w-6 h-6 text-purple-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{departments.length}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Departments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
								<Users className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{departments.reduce(
										(sum, d) => sum + d.faculty_count,
										0
									)}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Faculty
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
								<BookOpen className="w-6 h-6 text-emerald-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{departments.reduce(
										(sum, d) => sum + d.course_count,
										0
									)}
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
							<div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
								<GraduationCap className="w-6 h-6 text-orange-500" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{departments.reduce(
										(sum, d) => sum + d.student_count,
										0
									)}
								</p>
								<p className="text-sm text-muted-foreground">
									Total Students
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Departments Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="w-5 h-5" />
						All Departments
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Code</TableHead>
									<TableHead>Department Name</TableHead>
									<TableHead>HOD</TableHead>
									<TableHead className="text-center">
										Faculty
									</TableHead>
									<TableHead className="text-center">
										Staff
									</TableHead>
									<TableHead className="text-center">
										Courses
									</TableHead>
									<TableHead className="text-center">
										Students
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{departments.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={7}
											className="text-center py-8 text-muted-foreground"
										>
											No departments found
										</TableCell>
									</TableRow>
								) : (
									departments.map((dept) => (
										<TableRow key={dept.department_id}>
											<TableCell>
												<Badge variant="outline">
													{dept.department_code}
												</Badge>
											</TableCell>
											<TableCell className="font-medium">
												{dept.department_name}
											</TableCell>
											<TableCell>
												{dept.hod_name || (
													<span className="text-muted-foreground italic">
														Not assigned
													</span>
												)}
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant="secondary"
													className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
												>
													{dept.faculty_count}
												</Badge>
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant="secondary"
													className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
												>
													{dept.staff_count}
												</Badge>
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant="secondary"
													className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
												>
													{dept.course_count}
												</Badge>
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant="secondary"
													className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
												>
													{dept.student_count}
												</Badge>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
