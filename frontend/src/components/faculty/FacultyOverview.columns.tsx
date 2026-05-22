import type { ColumnDef } from "@tanstack/react-table";
import type { Course } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Archive, Eye } from "lucide-react";
import { sortableHeader } from "../../features/shared/tableUtils";
import { useNavigate } from "react-router-dom";

export function getFacultyOverviewColumns(
	openConcludeDialog: (course: Course) => void,
): ColumnDef<Course>[] {
	return [
		// ── Expand toggle ──────────────────────────────────────────────────
		{
			id: "expand",
			header: () => null,
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 text-muted-foreground"
					onClick={() => row.toggleExpanded()}
					aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
				>
					<ChevronRight
						className={`h-4 w-4 transition-transform duration-150 ${
							row.getIsExpanded() ? "rotate-90" : ""
						}`}
					/>
				</Button>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "course_code",
			header: sortableHeader("Code"),
			cell: ({ row }) => (
				<Badge variant="outline">{row.original.course_code}</Badge>
			),
		},
		{
			accessorKey: "course_name",
			header: sortableHeader("Course Name", "text-left"),
			cell: ({ row }) => (
				<div
					className="max-w-60 truncate text-left font-medium"
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
				<Badge variant="secondary">{row.original.credit} Cr</Badge>
			),
		},
		{
			accessorKey: "year",
			header: sortableHeader("Year"),
			cell: ({ row }) => row.original.year,
		},
		{
			accessorKey: "semester",
			header: sortableHeader("Sem"),
			cell: ({ row }) => (
				<Badge variant="outline">{row.original.semester}</Badge>
			),
		},
		{
			accessorKey: "enrollment_count",
			header: sortableHeader("Enrolled"),
			cell: ({ row }) => {
				const count = row.original.enrollment_count;
				return (
					<Badge
						variant="outline"
						className={
							count === 0
								? "bg-muted text-muted-foreground border-muted/50 shadow-sm"
								: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold shadow-sm"
						}
					>
						{count} Students
					</Badge>
				);
			},
		},
		{
			accessorKey: "test_count",
			header: sortableHeader("Tests"),
			cell: ({ row }) => {
				const count = row.original.test_count;
				return (
					<Badge
						variant="outline"
						className={
							count === 0
								? "bg-muted text-muted-foreground border-muted/50 shadow-sm"
								: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold shadow-sm"
						}
					>
						{count} Tests
					</Badge>
				);
			},
		},
		{
			accessorKey: "avg_score_pct",
			header: sortableHeader("Avg Score"),
			cell: ({ row }) => {
				const avg = row.original.avg_score_pct;
				if (avg == null)
					return <span className="text-muted-foreground">—</span>;
				let badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold shadow-sm";
				if (avg < 50) badgeClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold shadow-sm";
				else if (avg < 70) badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold shadow-sm";

				return (
					<Badge variant="outline" className={badgeClass}>
						{avg}%
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const navigate = useNavigate();
				const course = row.original;
				const offeringId = course.offering_id || course.course_id;

				if (course.is_active === 0 || course.cfa_is_active === 0) {
					return (
						<div className="flex justify-start gap-2">
							<Button
								variant="ghost"
								size="sm"
								title="View CO-PO Mapping"
								onClick={() =>
									navigate(
										`/faculty/copo?offering_id=${offeringId}`,
									)
								}
								className="h-8 gap-2 text-primary hover:bg-primary/[0.06] hover:text-primary font-semibold active:scale-95 duration-200 transition-all border border-muted/50 hover:border-primary/20"
							>
								<Eye className="h-4 w-4 text-primary" />
								CO-PO
							</Button>
						</div>
					);
				}
				return (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => openConcludeDialog(course)}
						className="h-8 gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all font-semibold border border-rose-500/20"
					>
						<Archive className="h-4 w-4 text-rose-500" />
						Conclude
					</Button>
				);
			},
		},
	];
}
