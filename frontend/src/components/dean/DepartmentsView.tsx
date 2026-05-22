import { DataTable } from "@/features/shared/DataTable";
import { Building2, Users, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeanDepartment } from "@/services/api";
import { deanApi } from "@/services/api/dean";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { useMemo } from "react";
import { getDeanDepartmentColumns } from "./DepartmentsView.columns";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function DepartmentsView() {
	const {
		data: departments,
		loading,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
	} = usePaginatedData<DeanDepartment, { hod_status: string }>({
		fetchFn: (params) => deanApi.getAllDepartments(params),
		limit: 20,
		defaultSort: "d.department_code",
	});
	const columns = useMemo(() => getDeanDepartmentColumns(), []);

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-indigo-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-200">
								<Building2 className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
									{pagination?.total ?? "—"}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Total Departments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-cyan-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
								<Users className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
									{departments.reduce(
										(sum, d) =>
											sum + (d.faculty_count ?? 0),
										0,
									)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Faculty (this page)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
								<BookOpen className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
									{departments.reduce(
										(sum, d) => sum + (d.course_count ?? 0),
										0,
									)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Courses (this page)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 to-amber-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform duration-200">
								<GraduationCap className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
									{departments.reduce(
										(sum, d) =>
											sum + (d.student_count ?? 0),
										0,
									)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Students (this page)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Departments Table */}
			<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-teal-500 to-transparent"></div>
				<CardHeader className="pb-4 border-b bg-muted/[.06] pt-5">
					<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
						<div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
							<Building2 className="w-4 h-4" />
						</div>
						All Departments
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<DataTable
						columns={columns}
						data={departments}
						searchPlaceholder="Filter departments..."
						refreshing={loading}
						serverPagination={{
							pagination,
							onNext: goNext,
							onPrev: goPrev,
							canPrev,
							pageIndex,
							search,
							onSearch: setSearch,
						}}
					>
						<Select
							value={filters.hod_status || "all"}
							onValueChange={(value) =>
								setFilter(
									"hod_status",
									value === "all" ? undefined : value,
								)
							}
						>
							<SelectTrigger className="h-9 w-[180px]">
								<SelectValue placeholder="HOD Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All HOD Status
								</SelectItem>
								<SelectItem value="assigned">
									Assigned
								</SelectItem>
								<SelectItem value="unassigned">
									Unassigned
								</SelectItem>
							</SelectContent>
						</Select>
					</DataTable>
				</CardContent>
			</Card>
		</div>
	);
}
