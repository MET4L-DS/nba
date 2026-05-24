import type { ColumnDef } from "@tanstack/react-table";
import type { EnrolledStudent } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { sortableHeader } from "../../features/shared/tableUtils";
import { EnrolledCoursesCell } from "./components/EnrolledCoursesCell";
import { statusVariant } from "./utils";

export { STATUS_OPTIONS } from "./constants";
export { statusVariant };

export function getFacultyStudentsColumns(
	handleEditOpen: (s: EnrolledStudent) => void,
	setDeleteTarget: (s: EnrolledStudent | null) => void,
): ColumnDef<EnrolledStudent>[] {
	return [
		{
			accessorKey: "roll_no",
			header: sortableHeader("Roll No"),
			cell: ({ row }) => (
				<Badge variant="outline" className="font-mono text-xs rounded-xl bg-background/50 border-muted-foreground/20 font-semibold px-2.5 py-0.5">
					{row.original.roll_no}
				</Badge>
			),
		},
		{
			accessorKey: "student_name",
			header: sortableHeader("Name", "text-left"),
			cell: ({ row }) => (
				<div className="font-semibold text-left max-w-[180px] truncate text-foreground/90">{row.original.student_name}</div>
			),
		},
		{
			accessorKey: "department_code",
			header: "Department",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 font-bold rounded-xl px-2.5 py-0.5"
				>
					{row.original.department_code ??
						row.original.department_name}
				</Badge>
			),
		},
		{
			accessorKey: "batch_year",
			header: sortableHeader("Batch"),
			cell: ({ row }) => <span className="font-medium text-foreground/80">{row.original.batch_year ?? "—"}</span>,
		},
		{
			accessorKey: "email",
			header: sortableHeader("Email", "text-left"),
			cell: ({ row }) => (
				<div className="text-xs text-muted-foreground text-left max-w-[200px] truncate font-medium">
					{row.original.email ?? "—"}
				</div>
			),
		},
		{
			accessorKey: "phones",
			header: "Phones",
			cell: ({ row }) => {
				const phones = row.original.phones?.length
					? row.original.phones
					: (row.original as any).phone
						? [(row.original as any).phone]
						: [];
				if (!phones || phones.length === 0) {
					return <div className="text-muted-foreground font-medium text-xs">—</div>;
				}
				return (
					<div className="flex flex-wrap gap-1">
						{phones.map((p, i) => (
							<Badge
								key={i}
								variant="outline"
								className="font-mono text-xs rounded-lg bg-background/40 font-medium px-1.5"
							>
								{p}
							</Badge>
						))}
					</div>
				);
			},
		},
		{
			accessorKey: "student_status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.student_status ?? "Active";
				const variant = statusVariant(status);
				
				return (
					<Badge variant={variant} className="rounded-xl px-2.5 py-0.5 font-bold">
						{status}
					</Badge>
				);
			},
		},
		{
			accessorKey: "enrolled_courses",
			header: "Enrolled In",
			cell: ({ row }) => {
				return (
					<EnrolledCoursesCell
						enrolledCourses={row.original.enrolled_courses}
						isExpanded={row.getIsExpanded()}
						onToggleExpand={row.getToggleExpandedHandler()}
					/>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-xl active:scale-95 duration-200 transition-all hover:bg-violet-500/10 hover:text-violet-600"
						onClick={() => handleEditOpen(row.original)}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all"
						onClick={() => setDeleteTarget(row.original)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];
}
