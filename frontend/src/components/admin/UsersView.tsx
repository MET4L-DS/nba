import { ConfirmDeleteDialog } from "../../features/shared";
import { AdminCreateUserDialog } from "./AdminCreateUserDialog";
import { useState, useMemo, useEffect } from "react";
import { UserList } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type {
	User,
	Department,
	CreateUserRequest,
	School,
} from "@/services/api";
import { adminApi } from "@/services/api/admin";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { getUsersViewColumns } from "./UsersView.columns";

export function UsersView({ currentUser }: { currentUser?: User | null }) {
	const {
		data: users,
		loading: refreshing,
		refresh,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
	} = usePaginatedData<User>({
		fetchFn: (params) => adminApi.getAllUsers(params),
		limit: 20,
		defaultSort: "u.employee_id",
	});

	const { data: departments } = usePaginatedData<Department>({
		fetchFn: (params) => adminApi.getAllDepartments(params),
		limit: 100,
		defaultSort: "d.department_code",
	});

	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [schools, setSchools] = useState<School[]>([]);

	useEffect(() => {
		adminApi
			.getAllSchools()
			.then((data) => setSchools(data))
			.catch((err) => console.error("Failed to load schools", err));
	}, []);

	const [newUser, setNewUser] = useState<CreateUserRequest>({
		employee_id: 0,
		username: "",
		email: "",
		password: "",
		role: "faculty",
		department_id: null,
		school_id: null,
		phones: [""],
	});

	const columns = useMemo<ColumnDef<User>[]>(
		() =>
			getUsersViewColumns({
				onDelete: (user) => {
					setUserToDelete(user);
					setIsDeleteUserOpen(true);
				},
				currentUserId: currentUser?.employee_id,
			}),
		[currentUser],
	);

	const handleCreateUser = async () => {
		if (
			!newUser.employee_id ||
			!newUser.username ||
			!newUser.email ||
			!newUser.password
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		// Phone validation
		const validPhones = (newUser.phones || []).filter(
			(p) => p.trim() !== "",
		);
		for (const phone of validPhones) {
			if (!/^\d{10}$/.test(phone)) {
				toast.error("Phone number must be exactly 10 digits");
				return;
			}
		}

		setSubmitting(true);
		try {
			const payload = { ...newUser, phones: validPhones };
			await apiService.createUser(payload);
			toast.success("User created successfully");
			setIsAddUserOpen(false);
			setNewUser({
				employee_id: 0,
				username: "",
				email: "",
				password: "",
				role: "faculty",
				department_id: null,
				designation: "",
				phones: [""],
			});
			refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to create user");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;

		setSubmitting(true);
		try {
			await apiService.deleteUser(userToDelete.employee_id);
			toast.success("User deleted successfully");
			setIsDeleteUserOpen(false);
			setUserToDelete(null);
			refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete user");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="relative overflow-hidden p-6 rounded-2xl border border-muted/50 bg-card/45 backdrop-blur-md shadow-lg group transition-all duration-300">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent" />
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Users Management</h2>
						<p className="text-muted-foreground text-sm mt-0.5">
							Manage all system users, credentials, and academic roles
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 duration-200 transition-all border border-indigo-500/30"
							onClick={() => setIsAddUserOpen(true)}
						>
							<Plus className="h-4 w-4" />
							Add User
						</Button>
					</div>
				</div>
			</div>

			<UserList
				columns={columns}
				data={users}
				searchPlaceholder="Search users by name, email or employee ID..."
				refreshing={refreshing}
				serverPagination={{
					pagination,
					onNext: goNext,
					onPrev: goPrev,
					canPrev,
					pageIndex,
					search,
					onSearch: setSearch,
					filters,
					setFilter,
				}}
			>
				{(_, currentFilters, currentSetFilter) => (
					<>
						<Select
							value={
								(currentFilters?.department_id as
									| string
									| undefined) || "all"
							}
							onValueChange={(val) =>
								currentSetFilter?.(
									"department_id",
									val === "all" ? undefined : val,
								)
							}
						>
							<SelectTrigger className="w-[180px] bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/30 active:scale-95 duration-200">
								<SelectValue placeholder="All Departments" />
							</SelectTrigger>
							<SelectContent className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
								<SelectItem value="all" className="rounded-lg focus:bg-muted/60">
									All Departments
								</SelectItem>
								{departments.map((dept) => (
									<SelectItem
										key={dept.department_id}
										value={dept.department_id.toString()}
										className="rounded-lg focus:bg-muted/60"
									>
										{dept.department_code}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={
								(currentFilters?.role as string | undefined) ||
								"all"
							}
							onValueChange={(val) =>
								currentSetFilter?.(
									"role",
									val === "all" ? undefined : val,
								)
							}
						>
							<SelectTrigger className="w-[140px] bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/30 active:scale-95 duration-200">
								<SelectValue placeholder="All Roles" />
							</SelectTrigger>
							<SelectContent className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
								<SelectItem value="all" className="rounded-lg focus:bg-muted/60">All Roles</SelectItem>
								<SelectItem value="admin" className="rounded-lg focus:bg-muted/60">Admin</SelectItem>
								<SelectItem value="faculty" className="rounded-lg focus:bg-muted/60">Faculty</SelectItem>
								<SelectItem value="staff" className="rounded-lg focus:bg-muted/60">Staff</SelectItem>
							</SelectContent>
						</Select>

						{(currentFilters?.department_id ||
							currentFilters?.role) && (
							<Button
								variant="ghost"
								onClick={() => {
									currentSetFilter?.(
										"department_id",
										undefined,
									);
									currentSetFilter?.("role", undefined);
								}}
								className="h-9 px-3 rounded-xl active:scale-95 duration-200 transition-all hover:bg-muted/50 text-muted-foreground hover:text-foreground"
							>
								Reset
								<X className="ml-2 h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</UserList>

			<AdminCreateUserDialog
				open={isAddUserOpen}
				onOpenChange={setIsAddUserOpen}
				newUser={newUser}
				setNewUser={setNewUser}
				departments={departments}
				schools={schools}
				onSubmit={handleCreateUser}
				isSubmitting={submitting}
			/>

			<ConfirmDeleteDialog
				open={isDeleteUserOpen}
				onOpenChange={setIsDeleteUserOpen}
				title="Delete User"
				description={
					<>
						Are you sure you want to delete{" "}
						<span className="font-semibold">
							{userToDelete?.username}
						</span>
						? This action cannot be undone.
					</>
				}
				confirmText="Delete"
				isLoading={submitting}
				onConfirm={handleDeleteUser}
			/>
		</div>
	);
}
