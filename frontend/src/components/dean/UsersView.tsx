import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Users, Search } from "lucide-react";
import type { DeanUser } from "@/services/api";

interface UsersViewProps {
	users: DeanUser[];
	isLoading: boolean;
}

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

export function UsersView({ users, isLoading }: UsersViewProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");

	// Get unique departments for filter
	const departments = Array.from(
		new Set(users.map((u) => u.department_name).filter(Boolean))
	) as string[];

	// Filter users
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.employee_id.toString().includes(searchTerm);

		const matchesRole = roleFilter === "all" || user.role === roleFilter;
		const matchesDepartment =
			departmentFilter === "all" ||
			user.department_name === departmentFilter;

		return matchesSearch && matchesRole && matchesDepartment;
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						All Users ({filteredUsers.length})
					</CardTitle>
					<div className="flex flex-col sm:flex-row gap-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9 w-full sm:w-[200px]"
							/>
						</div>
						<Select
							value={roleFilter}
							onValueChange={setRoleFilter}
						>
							<SelectTrigger className="w-full sm:w-[150px]">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="dean">Dean</SelectItem>
								<SelectItem value="hod">HOD</SelectItem>
								<SelectItem value="faculty">Faculty</SelectItem>
								<SelectItem value="staff">Staff</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={departmentFilter}
							onValueChange={setDepartmentFilter}
						>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Filter by department" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Departments
								</SelectItem>
								{departments.map((dept) => (
									<SelectItem key={dept} value={dept}>
										{dept}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Employee ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Department</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-8 text-muted-foreground"
									>
										No users found
									</TableCell>
								</TableRow>
							) : (
								filteredUsers.map((user) => (
									<TableRow key={user.employee_id}>
										<TableCell className="font-mono">
											{user.employee_id}
										</TableCell>
										<TableCell className="font-medium">
											{user.username}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{user.email}
										</TableCell>
										<TableCell>
											<Badge
												variant="secondary"
												className={getRoleBadgeColor(
													user.role
												)}
											>
												{user.role.toUpperCase()}
											</Badge>
										</TableCell>
										<TableCell>
											{user.department_code ? (
												<Badge variant="outline">
													{user.department_code}
												</Badge>
											) : (
												<span className="text-muted-foreground italic">
													N/A
												</span>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
