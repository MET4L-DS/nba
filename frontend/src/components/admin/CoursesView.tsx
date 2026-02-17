import { DataTable } from "@/components/shared/DataTable";
import { DataTableFacetedFilter } from "@/components/shared/DataTableFacetedFilter";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminCourse } from "@/services/api";

interface CoursesViewProps {
	courses: AdminCourse[];
	refreshing: boolean;
}

export function CoursesView({ courses, refreshing }: CoursesViewProps) {
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
			filterFn: (row, id, value) => {
				const val = row.getValue(id) as string;
				if (!val) return false;
				return value.includes(val);
			},
			cell: ({ row }) => {
				const name = row.getValue("department_name") as string;
				return name || "N/A";
			},
		},
		{
			accessorKey: "course_type",
			header: "Type",
			filterFn: (row, id, value) => {
				const val = row.getValue(id) as string;
				if (!val) return false;
				return value.includes(val);
			},
			cell: ({ row }) => {
				const val = row.getValue("course_type") as string;
				return <Badge variant="secondary">{val}</Badge>;
			},
		},
		{
			accessorKey: "course_level",
			header: "Level",
			filterFn: (row, id, value) => {
				const val = row.getValue(id) as string;
				if (!val) return false;
				return value.includes(val);
			},
		},
		{
			accessorKey: "is_active",
			header: "Status",
			cell: ({ row }) => {
				const isActive = row.getValue("is_active") === 1;
				return (
					<Badge variant={isActive ? "default" : "destructive"}>
						{isActive ? "Active" : "Inactive"}
					</Badge>
				);
			},
		},
	];

	// Extract unique values for filters
	const getUniqueValues = (key: keyof AdminCourse) => {
		return Array.from(new Set(courses.map((c) => c[key])))
			.filter(Boolean)
			.sort()
			.map((val) => ({
				label: String(val),
				value: String(val),
			}));
	};

	const departmentOptions = getUniqueValues("department_name");
	const typeOptions = getUniqueValues("course_type");
	const levelOptions = getUniqueValues("course_level");

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl font-bold">Courses</h2>
				<p className="text-gray-500 dark:text-gray-400">
					All courses in the system
				</p>
			</div>

			<DataTable
				columns={columns}
				data={courses}
				searchKey="course_name"
				searchPlaceholder="Filter by course name..."
				refreshing={refreshing}
			>
				{(table) => (
					<>
						{table.getColumn("department_name") && (
							<DataTableFacetedFilter
								column={table.getColumn("department_name")}
								title="Department"
								options={departmentOptions}
							/>
						)}
						{table.getColumn("course_type") && (
							<DataTableFacetedFilter
								column={table.getColumn("course_type")}
								title="Type"
								options={typeOptions}
							/>
						)}
						{table.getColumn("course_level") && (
							<DataTableFacetedFilter
								column={table.getColumn("course_level")}
								title="Level"
								options={levelOptions}
							/>
						)}
					</>
				)}
			</DataTable>
		</div>
	);
}
