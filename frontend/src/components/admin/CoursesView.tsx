import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminCourse, Department } from "@/services/api";
import { adminApi } from "@/services/api/admin";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function CoursesView() {
	const {
		data: courses,
		loading,
		error,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
	} = usePaginatedData<AdminCourse>({
		fetchFn: (params) => adminApi.getAllCourses(params),
		limit: 20,
		defaultSort: "c.course_code",
	});

	const [departments, setDepartments] = useState<Department[]>([]);

	useEffect(() => {
		adminApi
			.getAllDepartments({ limit: 100 })
			.then((res) => setDepartments(res.data))
			.catch(() => {});
	}, []);

	const columns: ColumnDef<AdminCourse>[] = [
		{
			accessorKey: "course_code",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
					className="p-0 hover:bg-transparent"
				>
					Code
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("course_code")}</div>
			),
		},
		{
			accessorKey: "course_name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
					className="p-0 hover:bg-transparent"
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
		},
		{
			accessorKey: "credit",
			header: "Credits",
			cell: ({ row }) => (
				<Badge variant="outline">{row.getValue("credit")}</Badge>
			),
		},
		{
			accessorKey: "department_name",
			header: "Department",
			cell: ({ row }) => {
				const name = row.getValue("department_name") as string;
				return name || "N/A";
			},
		},
		{
			accessorKey: "course_type",
			header: "Type",
			cell: ({ row }) => {
				const val = row.getValue("course_type") as string;
				return <Badge variant="secondary">{val}</Badge>;
			},
		},
		{
			accessorKey: "course_level",
			header: "Level",
		},
		{
			accessorKey: "is_active",
			header: "Status",
			cell: ({ row }) => {
				const isActive =
					row.getValue("is_active") === 1 ||
					row.getValue("is_active") === true;
				return (
					<Badge variant={isActive ? "default" : "destructive"}>
						{isActive ? "Active" : "Inactive"}
					</Badge>
				);
			},
		},
	];

	if (error) {
		return (
			<div className="text-red-500 p-4">
				Failed to load courses: {error}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold">Courses</h2>
					<p className="text-gray-500 dark:text-gray-400">
						All courses in the system
					</p>
				</div>
			</div>

			<DataTable
				columns={columns}
				data={courses}
				searchPlaceholder="Search by course name or code..."
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
				{() => (
					<>
						<Select
							value={
								(filters.department_id as string | undefined) ||
								"all"
							}
							onValueChange={(val) =>
								setFilter(
									"department_id",
									val === "all" ? undefined : val,
								)
							}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="All Departments" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Departments
								</SelectItem>
								{departments.map((dept) => (
									<SelectItem
										key={dept.department_id}
										value={String(dept.department_id)}
									>
										{dept.department_code}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={
								(filters.course_type as string | undefined) ||
								"all"
							}
							onValueChange={(val) =>
								setFilter(
									"course_type",
									val === "all" ? undefined : val,
								)
							}
						>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="All Types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="Theory">Theory</SelectItem>
								<SelectItem value="Lab">Lab</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={
								filters.is_active !== undefined
									? String(filters.is_active)
									: "all"
							}
							onValueChange={(val) =>
								setFilter(
									"is_active",
									val === "all" ? undefined : val,
								)
							}
						>
							<SelectTrigger className="w-[130px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="1">Active</SelectItem>
								<SelectItem value="0">Inactive</SelectItem>
							</SelectContent>
						</Select>

						{(filters.department_id ||
							filters.course_type ||
							filters.is_active) && (
							<Button
								variant="ghost"
								onClick={() => {
									setFilter("department_id", undefined);
									setFilter("course_type", undefined);
									setFilter("is_active", undefined);
								}}
								className="h-9 px-2 lg:px-3"
							>
								Reset
								<X className="ml-2 h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</DataTable>
		</div>
	);
}
