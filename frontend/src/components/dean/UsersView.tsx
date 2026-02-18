import { DataTable } from "@/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Users, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DeanUser, DeanDepartment } from "@/services/api";
import { deanApi } from "@/services/api/dean";
import { usePaginatedData } from "@/lib/usePaginatedData";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const getRoleBadgeColor = (role: string) => {
	switch (role) {
		case "admin":
			return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
		case "dean":
			return "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
		case "hod":
			return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
		case "faculty":
			return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
		case "staff":
			return "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
		default:
			return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
	}
};

export function UsersView() {
	const {
		data: users,
		loading,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
	} = usePaginatedData<DeanUser, { role: string; department_id: string }>({
		fetchFn: (params) => deanApi.getAllUsers(params),
		limit: 20,
		defaultSort: "u.employee_id",
	});

	const { data: departments } = usePaginatedData<DeanDepartment>({
		fetchFn: (params) => deanApi.getAllDepartments(params),
		limit: 100,
		defaultSort: "d.department_code",
	});

	const hasFilters = !!filters.role || !!filters.department_id;

	const columns: ColumnDef<DeanUser>[] = [
		{
			accessorKey: "employee_id",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Employee ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-mono">{row.getValue("employee_id")}</div>
			),
		},
		{
			accessorKey: "username",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("username")}</div>
			),
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Email
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					{row.getValue("email")}
				</div>
			),
		},
		{
			accessorKey: "role",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Role
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const role = row.getValue("role") as string;
				const user = row.original;
				return (
					<div className="flex gap-1 flex-wrap">
						<Badge
							variant="secondary"
							className={getRoleBadgeColor(role)}
						>
							{role.toUpperCase()}
						</Badge>
						{user.is_hod && (
							<Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
								HOD
							</Badge>
						)}
						{user.is_dean && (
							<Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800">
								DEAN
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "department_name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Department
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const deptCode = row.original.department_code;
				return deptCode ? (
					<Badge variant="outline">{deptCode}</Badge>
				) : (
					<span className="text-muted-foreground italic">N/A</span>
				);
			},
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="w-5 h-5" />
					All Users
				</CardTitle>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={users}
					searchPlaceholder="Search users..."
					refreshing={loading}
					serverPagination={{
						pagination,
						onNext: goNext,
						onPrev: goPrev,
						canPrev,
						pageIndex,
						search,
						onSearch: setSearch,
					}}
				>
					<Select
						value={filters.department_id || "all"}
						onValueChange={(value) =>
							setFilter(
								"department_id",
								value === "all" ? undefined : value,
							)
						}
					>
						<SelectTrigger className="h-9 w-[180px]">
							<SelectValue placeholder="All Departments" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Departments</SelectItem>
							{departments.map((dept) => (
								<SelectItem
									key={dept.department_id}
									value={String(dept.department_id)}
								>
									{dept.department_code}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={filters.role || "all"}
						onValueChange={(value) =>
							setFilter(
								"role",
								value === "all" ? undefined : value,
							)
						}
					>
						<SelectTrigger className="h-9 w-[150px]">
							<SelectValue placeholder="All Roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="faculty">Faculty</SelectItem>
							<SelectItem value="staff">Staff</SelectItem>
						</SelectContent>
					</Select>

					{hasFilters && (
						<Button
							variant="ghost"
							className="h-9 px-2"
							onClick={() => {
								setFilter("department_id", undefined);
								setFilter("role", undefined);
							}}
						>
							Reset
							<X className="ml-2 h-4 w-4" />
						</Button>
					)}
				</DataTable>
			</CardContent>
		</Card>
	);
}
