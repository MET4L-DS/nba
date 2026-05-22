import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { formatOrdinal } from "@/lib/utils";
import { sortableHeader } from "@/features/shared/tableUtils";
import { ConfirmDeleteDialog } from "@/features/shared";
import type { StaffCourse } from "@/services/api";

interface CourseColumnsProps {
	onEdit: (course: StaffCourse) => void;
	onDelete: (courseId: number, courseName: string) => void | Promise<void>;
}

export const getCourseColumns = ({
	onEdit,
	onDelete,
}: CourseColumnsProps): ColumnDef<StaffCourse>[] => [
	{
		accessorKey: "course_code",
		header: sortableHeader("Code"),
		cell: ({ row }) => (
			<span className="font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
				{row.original.course_code}
			</span>
		),
	},
	{
		accessorKey: "course_name",
		header: sortableHeader("Course Name", "text-left"),
		cell: ({ row }) => (
			<div
				className="font-bold text-left max-w-[220px] truncate text-foreground"
				title={row.original.course_name}
			>
				{row.original.course_name}
			</div>
		),
	},
	{
		accessorKey: "credit",
		header: "Credits",
		cell: ({ row }) => (
			<span className="font-semibold text-xs bg-muted/60 border border-muted/80 text-muted-foreground px-2 py-0.5 rounded-md shadow-sm">
				{row.original.credit} Credits
			</span>
		),
	},
	{
		accessorKey: "faculty_name",
		header: sortableHeader("Faculty", "text-left"),
		cell: ({ row }) => (
			<div className="font-semibold text-muted-foreground text-left max-w-[160px] truncate">
				{row.original.faculty_name || "—"}
			</div>
		),
	},
	{
		accessorKey: "year",
		header: "Year",
		cell: ({ row }) => (
			<span className="font-semibold text-foreground">{row.original.year ?? "—"}</span>
		),
	},
	{
		accessorKey: "semester",
		header: "Semester",
		cell: ({ row }) => (
			<span className="font-semibold text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md shadow-sm">
				{formatOrdinal(row.original.semester)} Sem
			</span>
		),
	},
	{
		accessorKey: "enrollment_count",
		header: "Enrolled",
		cell: ({ row }) => (
			<span className="font-semibold text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md shadow-sm">
				{row.original.enrollment_count ?? 0} Enrolled
			</span>
		),
	},
	{
		id: "actions",
		header: () => <div className="text-right mr-2">Actions</div>,
		cell: ({ row }) => {
			const course = row.original;
			return (
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 active:scale-95 duration-200 transition-all rounded-lg"
						onClick={() => onEdit(course)}
					>
						<Pencil className="w-4 h-4" />
					</Button>
					<ConfirmDeleteDialog
						title={<>Delete Course</>}
						description={
							<>
								Are you sure you want to delete "
								{course.course_name}"? This will also delete all
								associated tests, marks, and enrollments. This
								action cannot be undone.
							</>
						}
						onConfirm={() =>
							onDelete(course.course_id, course.course_name)
						}
						trigger={
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 duration-200 transition-all rounded-lg"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						}
					/>
				</div>
			);
		},
	},
];
