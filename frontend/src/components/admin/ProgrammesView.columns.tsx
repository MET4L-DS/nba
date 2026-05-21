import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, BookOpen, BarChart3 } from "lucide-react";
import type { Programme } from "@/services/api";
import { ConfirmDeleteDialog } from "../../features/shared";
import { sortableHeader } from "../../features/shared/tableUtils";

interface ProgrammeColumnProps {
	onEdit?: (programme: Programme) => void;
	onDelete?: (programme: Programme) => void;
	onEnroll?: (programme: Programme) => void;
	onManageCourses?: (programme: Programme) => void;
	onViewAttainment?: (programme: Programme) => void;
}

export function getProgrammeColumns({
	onEdit,
	onDelete,
	onEnroll,
	onManageCourses,
	onViewAttainment,
}: ProgrammeColumnProps): ColumnDef<Programme>[] {
	return [
		{
			accessorKey: "programme_code",
			header: sortableHeader("Code"),
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className="font-mono font-bold tracking-tight text-[11px] bg-primary/[0.04] text-primary border-primary/20 dark:border-primary/30"
				>
					{row.getValue("programme_code")}
				</Badge>
			),
		},
		{
			accessorKey: "programme_name",
			header: sortableHeader("Name", "text-left"),
			cell: ({ row }) => (
				<div className="font-semibold text-xs text-left text-foreground/90 leading-snug">
					{row.getValue("programme_name")}
				</div>
			),
		},
		{
			id: "batch",
			header: "Batch",
			cell: ({ row }) => {
				const batchYear = row.original.specific_batch_year;
				if (!batchYear) return <span className="text-muted-foreground/40 text-xs">—</span>;
				return (
					<Badge 
						variant="outline" 
						className="font-mono font-bold text-[10px] bg-muted/40 border-muted/80 text-muted-foreground"
					>
						{batchYear}
					</Badge>
				);
			},
		},
		{
			accessorKey: "degree_level",
			header: "Level",
			cell: ({ row }) => (
				<Badge 
					variant="outline"
					className="font-bold text-[10px] bg-background/50 border-muted text-muted-foreground/90"
				>
					{row.getValue("degree_level")}
				</Badge>
			),
		},
		{
			accessorKey: "duration_years",
			header: "Duration",
			cell: ({ row }) => (
				<span className="text-xs text-muted-foreground/90 font-medium">
					{row.getValue("duration_years")} Years
				</span>
			),
		},
		{
			accessorKey: "department_name",
			header: "Department",
			cell: ({ row }) => (
				<div className="text-xs text-muted-foreground truncate max-w-[150px]">
					{row.getValue("department_name") || row.original.department_code || "—"}
				</div>
			),
		},
		{
			id: "counts",
			header: () => <div className="text-center font-bold text-xs uppercase text-muted-foreground/80 tracking-wider">Statistics</div>,
			cell: ({ row }) => {
				const prog = row.original;
				return (
					<div className="flex flex-wrap gap-2 justify-center max-w-[160px] mx-auto">
						{typeof prog.student_count !== "undefined" && (
							<span
								className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
							>
								🎓 {prog.student_count}
							</span>
						)}
						{typeof prog.course_count !== "undefined" && (
							<span
								className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
							>
								📚 {prog.course_count}
							</span>
						)}
					</div>
				);
			},
		},
		{
			id: "attainment",
			header: () => <div className="text-center font-bold text-xs uppercase text-muted-foreground/80 tracking-wider">Attainment</div>,
			cell: ({ row }) => {
				const prog = row.original;
				return (
					<div className="flex justify-center">
						{onViewAttainment && (
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5 h-7 text-[11px] font-bold bg-background border-muted/80 text-foreground hover:bg-primary/[0.06] hover:text-primary hover:border-primary/40 transition-all hover:scale-105 active:scale-95 duration-200"
								onClick={() => onViewAttainment(prog)}
							>
								<BarChart3 className="w-3.5 h-3.5 text-primary/80" />
								View
							</Button>
						)}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const prog = row.original;
				return (
					<div className="flex justify-center gap-2">
						{onManageCourses && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onManageCourses(prog)}
								className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
								title="Manage Courses"
							>
								<BookOpen className="w-4 h-4" />
							</Button>
						)}
						{onEnroll && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onEnroll(prog)}
								className="text-green-600 hover:text-green-700 hover:bg-green-50"
								title="Bulk Enroll Students"
							>
								<UserPlus className="w-4 h-4" />
							</Button>
						)}
						{onEdit && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onEdit(prog)}
								className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
							>
								<Pencil className="w-4 h-4" />
							</Button>
						)}
						{onDelete && (
							<ConfirmDeleteDialog
								title={<>Are you absolutely sure?</>}
								description={
									<>
										This will permanently delete the{" "}
										<strong>{prog.programme_name}</strong>{" "}
										programme. This action cannot be undone.
									</>
								}
								onConfirm={() => onDelete(prog)}
								trigger={
									<Button
										variant="ghost"
										size="icon"
										className="text-red-600 hover:text-red-700 hover:bg-red-50"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								}
							/>
						)}
					</div>
				);
			},
		},
	];
}
