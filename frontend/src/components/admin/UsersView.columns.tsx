import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { sortableHeader } from "@/features/shared/tableUtils";
import { getBaseUserColumns } from "@/features/shared";

import type { User } from "@/services/api";

interface UsersViewColumnsProps {
	onDelete: (user: User) => void;
	currentUserId?: number; // pass the current user id to hide delete button for self
}

const getCustomRoleBadgeClass = (role: string) => {
	switch (role.toLowerCase()) {
		case "admin":
			return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-sm";
		case "dean":
			return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-sm";
		case "hod":
			return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-sm";
		case "faculty":
			return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-sm";
		case "staff":
			return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-sm";
		default:
			return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 shadow-sm";
	}
};

export const getUsersViewColumns = ({
	onDelete,
	currentUserId,
}: UsersViewColumnsProps): ColumnDef<User>[] => [
	...getBaseUserColumns<User>(),
	{
		accessorKey: "designation",
		header: sortableHeader("Designation", "text-left"),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground italic font-medium">
				{row.getValue("designation") || "—"}
			</span>
		),
	},
	{
		id: "phones",
		header: "Phones",
		cell: ({ row }) => {
			const phones = row.original.phones;
			return (
				<div className="text-muted-foreground flex flex-wrap gap-1">
					{phones && phones.length > 0
						? phones.map((phone, i) => (
								<Badge
									variant="outline"
									key={i}
									className="font-mono bg-slate-500/5 text-slate-600 dark:text-slate-400 border-slate-500/10 shadow-sm"
								>
									{phone}
								</Badge>
							))
						: "—"}
				</div>
			);
		},
	},
	{
		accessorKey: "role",
		header: sortableHeader("Role"),
		cell: ({ row }) => {
			const user = row.original;
			const isHOD = user.role === "hod";
			const isDean = Number(user.is_dean) === 1;

			return (
				<div className="flex gap-1.5 flex-wrap">
					<Badge
						variant="outline"
						className={`font-semibold tracking-wide ${getCustomRoleBadgeClass(user.role)}`}
					>
						{user.role.toUpperCase()}
					</Badge>
					{isDean && (
						<Badge
							variant="outline"
							className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold tracking-wide shadow-sm"
						>
							DEAN
						</Badge>
					)}
					{isHOD && (
						<Badge
							variant="outline"
							className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold tracking-wide shadow-sm"
						>
							HOD
						</Badge>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "department_code",
		header: sortableHeader("Department"),
		cell: ({ row }) => {
			const deptCode = row.getValue("department_code") as string;
			return deptCode ? (
				<Badge
					variant="outline"
					className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-semibold shadow-sm"
				>
					{deptCode}
				</Badge>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const user = row.original;
			if (user.employee_id === currentUserId) return null;
			return (
				<div className="text-center">
					<Button
						variant="ghost"
						size="icon"
						className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 active:scale-95 duration-200 transition-all rounded-xl"
						onClick={() => onDelete(user)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			);
		},
	},
];
