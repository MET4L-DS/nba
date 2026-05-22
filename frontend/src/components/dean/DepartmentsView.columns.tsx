import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { DeanDepartment } from "@/services/api";
import { sortableHeader } from "../../features/shared/tableUtils";

export function getDeanDepartmentColumns(): ColumnDef<DeanDepartment>[] {
	return [
		{
			accessorKey: "department_code",
			header: sortableHeader("Code"),
			cell: ({ row }) => (
				<Badge variant="outline" className="border-muted/50 text-muted-foreground shadow-sm font-semibold rounded-md">
					{row.getValue("department_code")}
				</Badge>
			),
		},
		{
			accessorKey: "department_name",
			header: sortableHeader("Department Name", "text-left"),
			cell: ({ row }) => (
				<div className="font-semibold text-left text-foreground/90">
					{row.getValue("department_name")}
				</div>
			),
		},
		{
			accessorKey: "hod_name",
			header: "Serving HOD",
			cell: ({ row }) => {
				const hodName = row.original.hod_name;
				return hodName ? (
					<Badge
						variant="outline"
						className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shadow-none rounded-md"
					>
						{hodName}
					</Badge>
				) : (
					<Badge
						variant="outline"
						className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold shadow-none rounded-md"
					>
						Not Assigned
					</Badge>
				);
			},
		},
		{
			accessorKey: "faculty_count",
			header: sortableHeader("Faculty"),
			cell: ({ row }) => (
				<div className="text-center">
					<Badge
						variant="secondary"
						className="bg-blue-500/10 text-blue-600 border border-blue-500/20 font-semibold rounded-md"
					>
						{row.getValue("faculty_count")}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "staff_count",
			header: sortableHeader("Staff"),
			cell: ({ row }) => (
				<div className="text-center">
					<Badge
						variant="secondary"
						className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold rounded-md"
					>
						{row.getValue("staff_count")}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "course_count",
			header: sortableHeader("Courses"),
			cell: ({ row }) => (
				<div className="text-center">
					<Badge
						variant="secondary"
						className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold rounded-md"
					>
						{row.getValue("course_count")}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "student_count",
			header: sortableHeader("Students"),
			cell: ({ row }) => (
				<div className="text-center">
					<Badge
						variant="secondary"
						className="bg-purple-500/10 text-purple-600 border border-purple-500/20 font-semibold rounded-md"
					>
						{row.getValue("student_count")}
					</Badge>
				</div>
			),
		},
	];
}
