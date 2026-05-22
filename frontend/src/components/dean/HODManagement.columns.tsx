import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import type { DeanDepartment, HODHistoryRecord } from "@/services/api";
import { sortableHeader } from "../../features/shared/tableUtils";

interface StatusColumnProps {
	onAppointClick: (dept: DeanDepartment) => void;
	onDemoteClick: (dept: DeanDepartment) => void;
}

export function getStatusColumns({
	onAppointClick,
	onDemoteClick,
}: StatusColumnProps): ColumnDef<DeanDepartment>[] {
	return [
		{
			accessorKey: "department_code",
			header: sortableHeader("Code"),
			cell: ({ row }) => (
				<Badge
					variant="secondary"
					className="bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-none font-semibold rounded-md"
				>
					{row.getValue("department_code")}
				</Badge>
			),
		},
		{
			accessorKey: "department_name",
			header: sortableHeader("Department", "text-left"),
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
				const hod = row.getValue("hod_name") as string;
				return hod ? (
					<Badge
						variant="outline"
						className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shadow-none rounded-md"
					>
						{hod}
					</Badge>
				) : (
					<Badge
						variant="outline"
						className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold shadow-none rounded-md"
					>
						No HOD Recorded
					</Badge>
				);
			},
		},
		{
			accessorKey: "faculty_count",
			header: sortableHeader("Faculty Count"),
			cell: ({ row }) => (
				<div className="flex items-center gap-2 ml-4 font-medium text-muted-foreground">
					<Users className="w-4 h-4 text-blue-500/70" />
					{row.getValue("faculty_count")}
				</div>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const dept = row.original;
				return (
					<div className="text-right">
						{dept.hod_name ? (
							<Button
								size="sm"
								variant="outline"
								onClick={() => onDemoteClick(dept)}
								className="h-8 border-rose-500/20 text-rose-600 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all font-semibold rounded-lg"
							>
								Replace Serving HOD
							</Button>
						) : (
							<Button
								size="sm"
								onClick={() => onAppointClick(dept)}
								className="h-8 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white shadow-sm hover:shadow-md active:scale-95 duration-200 transition-all border-none font-semibold rounded-lg"
							>
								<UserPlus className="w-4 h-4 mr-2" />
								Record Serving HOD
							</Button>
						)}
					</div>
				);
			},
		},
	];
}

export function getHistoryColumns(): ColumnDef<HODHistoryRecord>[] {
	return [
		{
			accessorKey: "department_code",
			header: "Dept",
			cell: ({ row }) => (
				<Badge
					variant="secondary"
					className="bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-none font-semibold rounded-md"
				>
					{row.getValue("department_code")}
				</Badge>
			),
		},
		{
			accessorKey: "username",
			header: sortableHeader("Faculty Name", "text-left"),
			cell: ({ row }) => (
				<div className="font-semibold text-left text-foreground/90">
					{row.getValue("username")}
					<div className="text-xs text-muted-foreground font-normal">
						{(row.original as HODHistoryRecord).email}
					</div>
				</div>
			),
		},
		{
			accessorKey: "appointment_order",
			header: "Appointment Order",
			cell: ({ row }) => (
				<span className="text-sm font-mono text-muted-foreground">
					{(row.getValue("appointment_order") as string | null) ??
						"—"}
				</span>
			),
		},
		{
			accessorKey: "start_date",
			header: sortableHeader("Start Date"),
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground font-medium">
					{new Date(
						row.getValue("start_date") as string,
					).toLocaleDateString()}
				</span>
			),
		},
		{
			accessorKey: "end_date",
			header: "End Date",
			cell: ({ row }) => {
				const end = row.getValue("end_date") as string | null;
				return (
					<span className="text-sm text-muted-foreground font-medium">
						{end ? new Date(end).toLocaleDateString() : "—"}
					</span>
				);
			},
		},
		{
			accessorKey: "is_current",
			header: "Status",
			cell: ({ row }) => {
				const current = row.getValue("is_current") as number;
				return current ? (
					<Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shadow-none rounded-md">
						Current HOD
					</Badge>
				) : (
					<Badge
						variant="secondary"
						className="bg-muted text-muted-foreground border border-muted/50 shadow-none font-semibold rounded-md"
					>
						Past HOD
					</Badge>
				);
			},
		},
	];
}
