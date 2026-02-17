import { DataTable } from "@/components/shared/DataTable";
import { DataTableFacetedFilter } from "@/components/shared/DataTableFacetedFilter";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student } from "@/services/api";

interface StudentsViewProps {
	students: Student[];
	refreshing: boolean;
}

export function StudentsView({ students, refreshing }: StudentsViewProps) {
	const columns: ColumnDef<Student>[] = [
		{
			accessorKey: "roll_no",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
					className="p-0 hover:bg-transparent"
				>
					Roll No
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("roll_no")}</div>
			),
		},
		{
			accessorKey: "student_name",
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
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => (
				<div className="text-sm text-gray-500">
					{row.getValue("email") || "-"}
				</div>
			),
		},
		{
			accessorKey: "batch_year",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
					className="p-0 hover:bg-transparent"
				>
					Batch
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			filterFn: (row, id, value) => {
				return value.includes(String(row.getValue(id)));
			},
		},
		{
			accessorKey: "department_code",
			header: "Department",
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			cell: ({ row }) => {
				const student = row.original;
				return (
					<Badge variant="outline">
						{student.department_code || student.department_id}
					</Badge>
				);
			},
		},
		{
			accessorKey: "student_status",
			header: "Status",
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			cell: ({ row }) => {
				const status = row.getValue("student_status") as string;
				return (
					<Badge
						variant={status === "Active" ? "default" : "secondary"}
					>
						{status}
					</Badge>
				);
			},
		},
	];

	const departmentOptions = Array.from(
		new Set(
			students
				.map((s) => s.department_code)
				.filter((n): n is string => !!n),
		),
	)
		.sort()
		.map((name) => ({ label: name, value: name }));

	const batchOptions = Array.from(
		new Set(students.map((s) => s.batch_year).filter(Boolean)),
	)
		.sort((a, b) => b - a)
		.map((year) => ({ label: String(year), value: String(year) }));

	const statusOptions = Array.from(
		new Set(students.map((s) => s.student_status).filter(Boolean)),
	)
		.sort()
		.map((status) => ({ label: status, value: status }));

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl font-bold">Students</h2>
				<p className="text-gray-500 dark:text-gray-400">
					All registered students
				</p>
			</div>

			<DataTable
				columns={columns}
				data={students}
				searchKey="student_name"
				searchPlaceholder="Filter by name..."
				refreshing={refreshing}
			>
				{(table) => (
					<>
						{table.getColumn("department_code") && (
							<DataTableFacetedFilter
								column={table.getColumn("department_code")}
								title="Department"
								options={departmentOptions}
							/>
						)}
						{table.getColumn("batch_year") && (
							<DataTableFacetedFilter
								column={table.getColumn("batch_year")}
								title="Batch"
								options={batchOptions}
							/>
						)}
						{table.getColumn("student_status") && (
							<DataTableFacetedFilter
								column={table.getColumn("student_status")}
								title="Status"
								options={statusOptions}
							/>
						)}
					</>
				)}
			</DataTable>
		</div>
	);
}
