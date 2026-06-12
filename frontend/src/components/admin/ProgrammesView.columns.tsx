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
	onOffer?: (programme: Programme) => void;
	onEditBatch?: (programme: Programme) => void;
	onDeleteBatch?: (programme: Programme) => void;
}

export function getProgrammeColumns({
	onEdit,
	onDelete,
	onEnroll,
	onManageCourses,
	onViewAttainment,
	onOffer,
	onEditBatch,
	onDeleteBatch,
}: ProgrammeColumnProps): ColumnDef<Programme>[] {
	return [
		{
			accessorKey: "programme_code",
			header: sortableHeader("Code"),
			cell: ({ row }) => (
				<Badge
					className="font-mono font-bold tracking-tight text-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-none"
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
				const status = row.original.batch_status;
				if (!batchYear) return <span className="text-muted-foreground/40 text-xs">—</span>;

				let statusColor = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
				if (status === "active") {
					statusColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
				} else if (status === "upcoming") {
					statusColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
				} else if (status === "completed") {
					statusColor = "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
				}

				return (
					<div className="flex items-center gap-1.5 justify-center">
						<Badge
							className="font-mono font-bold text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-none"
						>
							{batchYear}
						</Badge>
						{status && (
							<Badge className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-none ${statusColor}`}>
								{status}
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "degree_level",
			header: sortableHeader("Level"),
			cell: ({ row }) => (
				<Badge
					className="font-bold text-[10px] bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shadow-none"
				>
					{row.getValue("degree_level")}
				</Badge>
			),
		},
		{
			accessorKey: "duration_years",
			header: sortableHeader("Duration"),
			cell: ({ row }) => (
				<span className="text-xs text-muted-foreground/90 font-medium">
					{row.getValue("duration_years")} Years
				</span>
			),
		},
		{
			accessorKey: "department_name",
			header: sortableHeader("Department", "text-left"),
			cell: ({ row }) => (
				<div className="text-xs text-muted-foreground truncate max-w-[150px] text-left">
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
								className="gap-1.5 h-7 text-[11px] font-bold bg-background border-muted/80 text-foreground hover:bg-indigo-500/[0.06] hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-all hover:scale-105 active:scale-95 duration-200 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)]"
								onClick={() => onViewAttainment(prog)}
							>
								<BarChart3 className="w-3.5 h-3.5 text-indigo-500/85" />
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
				const isBatch = !!prog.batch_id;
				return (
					<div className="flex justify-center gap-2">
						{!isBatch && onOffer && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onOffer(prog)}
								className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold active:scale-95 duration-200 transition-all"
							>
								Offer Batch
							</Button>
						)}
						{onManageCourses && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onManageCourses(prog)}
								className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg active:scale-95 hover:scale-110 transition-all duration-200 border border-transparent hover:border-amber-500/20 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
								title="Manage Courses"
							>
								<BookOpen className="w-4 h-4" />
							</Button>
						)}
						{isBatch && onEnroll && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onEnroll(prog)}
								className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg active:scale-95 hover:scale-110 transition-all duration-200 border border-transparent hover:border-green-500/20 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]"
								title="Bulk Enroll Students"
							>
								<UserPlus className="w-4 h-4" />
							</Button>
						)}
						{isBatch ? (
							onEditBatch && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEditBatch(prog)}
									className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg active:scale-95 hover:scale-110 transition-all duration-200 border border-transparent hover:border-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
									title="Edit Batch Status"
								>
									<Pencil className="w-4 h-4" />
								</Button>
							)
						) : (
							onEdit && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEdit(prog)}
									className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg active:scale-95 hover:scale-110 transition-all duration-200 border border-transparent hover:border-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
									title="Edit Programme"
								>
									<Pencil className="w-4 h-4" />
								</Button>
							)
						)}
						{isBatch ? (
							onDeleteBatch && (
								<ConfirmDeleteDialog
									title={<>Are you absolutely sure?</>}
									description={
										<>
											This will permanently delete the offered batch{" "}
											<strong>{prog.specific_batch_year}</strong> for{" "}
											<strong>{prog.programme_name}</strong>. This action cannot be undone.
										</>
									}
									onConfirm={() => onDeleteBatch(prog)}
									trigger={
										<Button
											variant="ghost"
											size="icon"
											className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg active:scale-95 hover:scale-110 transition-all duration-200 border border-transparent hover:border-red-500/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
											title="Delete Offered Batch"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									}
								/>
							)
						) : (
							onDelete && (
								<ConfirmDeleteDialog
									title={<>Are you absolutely sure?</>}
									description={
										<>
											This will permanently delete the{" "}
											<strong>{prog.programme_name}</strong>{" "}
											programme catalog template. This action cannot be undone.
										</>
									}
									onConfirm={() => onDelete(prog)}
									trigger={
										<Button
											variant="ghost"
											size="icon"
											className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg active:scale-95 hover:scale-110 transition-all duration-200 border border-transparent hover:border-red-500/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
											title="Delete Programme"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									}
								/>
							)
						)}
					</div>
				);
			},
		},
	];
}
