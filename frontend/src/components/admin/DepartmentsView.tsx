import { DataTable } from "@/features/shared/DataTable";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { Department, School } from "@/services/api";
import { adminApi } from "@/services/api/admin";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { X } from "lucide-react";
import { getDepartmentColumns } from "./DepartmentsView.columns";

export function DepartmentsView() {
	const {
		data: departments,
		loading: refreshing,
		refresh: onDataRefresh,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
	} = usePaginatedData<Department, { school_id: string }>({
		fetchFn: (params) => adminApi.getAllDepartments(params),
		limit: 20,
		defaultSort: "d.department_code",
	});

	const [schools, setSchools] = useState<School[]>([]);
	useEffect(() => {
		adminApi
			.getAllSchools()
			.then(setSchools)
			.catch(() => {});
	}, []);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedDepartment, setSelectedDepartment] =
		useState<Department | null>(null);
	const [formData, setFormData] = useState({
		department_name: "",
		department_code: "",
		school_id: "",
		description: "",
	});
	const [editFormData, setEditFormData] = useState({
		department_name: "",
		department_code: "",
		school_id: "",
		description: "",
	});

	const openEditDialog = (department: Department) => {
		setSelectedDepartment(department);
		setEditFormData({
			department_name: department.department_name,
			department_code: department.department_code,
			school_id: department.school_id
				? department.school_id.toString()
				: "",
			description: department.description || "",
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteDepartment = async (department: Department) => {
		try {
			await apiService.deleteDepartment(department.department_id);
			toast.success(`Department "${department.department_name}" deleted`);
			onDataRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete department",
			);
		}
	};

	const columns = useMemo(
		() =>
			getDepartmentColumns({
				onEdit: openEditDialog,
				onDelete: handleDeleteDepartment,
			}),
		[],
	);

	const resetForm = () => {
		setFormData({
			department_name: "",
			department_code: "",
			school_id: "",
			description: "",
		});
	};

	const handleCreateDepartment = async () => {
		if (!formData.department_name || !formData.department_code) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (formData.department_code.length > 10) {
			toast.error("Department code must be 10 characters or less");
			return;
		}

		setIsSubmitting(true);
		try {
			await apiService.createDepartment({
				department_name: formData.department_name,
				department_code: formData.department_code.toUpperCase(),
				school_id: formData.school_id
					? parseInt(formData.school_id)
					: undefined,
				description: formData.description,
			});
			toast.success("Department created successfully");
			setIsAddDialogOpen(false);
			resetForm();
			onDataRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create department",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateDepartment = async () => {
		if (!selectedDepartment) return;

		if (!editFormData.department_name || !editFormData.department_code) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (editFormData.department_code.length > 10) {
			toast.error("Department code must be 10 characters or less");
			return;
		}

		setIsSubmitting(true);
		try {
			await apiService.updateDepartment(
				selectedDepartment.department_id,
				{
					department_name: editFormData.department_name,
					department_code: editFormData.department_code.toUpperCase(),
					school_id: editFormData.school_id
						? parseInt(editFormData.school_id)
						: null,
					description: editFormData.description,
				},
			);
			toast.success("Department updated successfully");
			setIsEditDialogOpen(false);
			setSelectedDepartment(null);
			onDataRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update department",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4 items-center justify-between bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-5 shadow-sm relative overflow-hidden mb-4">
				<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-indigo-500/20 pointer-events-none"></div>
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent"></div>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
						<Building2 className="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Departments</h3>
						<p className="text-sm text-muted-foreground mt-0.5">
							Manage university departments
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Dialog
						open={isAddDialogOpen}
						onOpenChange={setIsAddDialogOpen}
					>
						<DialogTrigger asChild>
							<Button className="gap-2 active:scale-95 duration-200 transition-all shadow-md hover:shadow-indigo-500/10">
								<Plus className="w-4 h-4" />
								Add Department
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-md border border-muted/50 rounded-2xl shadow-xl">
							<DialogHeader>
								<DialogTitle className="text-xl font-bold tracking-tight">
									Add New Department
								</DialogTitle>
								<DialogDescription className="text-muted-foreground">
									Create a new department in the system
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="department_name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Department Name *
									</Label>
									<Input
										id="department_name"
										placeholder="e.g., Computer Science & Engineering"
										value={formData.department_name}
										onChange={(e) =>
											setFormData({
												...formData,
												department_name:
													e.target.value,
											})
										}
										className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="department_code" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Department Code *
									</Label>
									<Input
										id="department_code"
										placeholder="e.g., CSE"
										maxLength={10}
										value={formData.department_code}
										onChange={(e) =>
											setFormData({
												...formData,
												department_code:
													e.target.value.toUpperCase(),
											})
										}
										className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
									/>
									<p className="text-[10px] text-muted-foreground">
										Short code (max 10 characters), will be auto-capitalized
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="school_id" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										School
									</Label>
									<Select
										value={formData.school_id || "none"}
										onValueChange={(val) =>
											setFormData({
												...formData,
												school_id:
													val === "none"
														? ""
														: val,
											})
										}
									>
										<SelectTrigger className="bg-background/60 shadow-inner focus:ring-1 transition-all">
											<SelectValue placeholder="Select a school" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">
												None
											</SelectItem>
											{schools.map((school) => (
												<SelectItem
													key={school.school_id}
													value={school.school_id.toString()}
												>
													{school.school_name} (
													{school.school_code})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Description (Optional)
									</Label>
									<Input
										id="description"
										placeholder="Department description"
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
									/>
								</div>
							</div>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button
									variant="outline"
									onClick={() => {
										setIsAddDialogOpen(false);
										resetForm();
									}}
									className="active:scale-95 duration-200 transition-all"
								>
									Cancel
								</Button>
								<Button
									onClick={handleCreateDepartment}
									disabled={isSubmitting}
									className="active:scale-95 duration-200 transition-all bg-indigo-600 hover:bg-indigo-700 text-white"
								>
									{isSubmitting
										? "Creating..."
										: "Create Department"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<DataTable
				columns={columns}
				data={departments || []}
				searchPlaceholder="Search departments..."
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
								(currentFilters?.school_id as string) || "all"
							}
							onValueChange={(val) =>
								currentSetFilter?.(
									"school_id",
									val === "all" ? undefined : val,
								)
							}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="All Schools" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Schools</SelectItem>
								{schools.map((school) => (
									<SelectItem
										key={school.school_id}
										value={school.school_id.toString()}
									>
										{school.school_code}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{currentFilters?.school_id && (
							<Button
								variant="ghost"
								onClick={() =>
									currentSetFilter?.("school_id", undefined)
								}
								className="h-9 px-2 lg:px-3"
							>
								Reset
								<X className="ml-2 h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</DataTable>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-md border border-muted/50 rounded-2xl shadow-xl">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold tracking-tight">Edit Department</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							Update department information
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit_department_name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
								Department Name *
							</Label>
							<Input
								id="edit_department_name"
								value={editFormData.department_name}
								onChange={(e) =>
									setEditFormData({
										...editFormData,
										department_name: e.target.value,
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit_department_code" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
								Department Code *
							</Label>
							<Input
								id="edit_department_code"
								maxLength={10}
								value={editFormData.department_code}
								onChange={(e) =>
									setEditFormData({
										...editFormData,
										department_code:
											e.target.value.toUpperCase(),
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
							/>
							<p className="text-[10px] text-muted-foreground">
								Short code (max 10 characters)
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit_school_id" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">School</Label>
							<Select
								value={editFormData.school_id || "none"}
								onValueChange={(val) =>
									setEditFormData({
										...editFormData,
										school_id: val === "none" ? "" : val,
									})
								}
							>
								<SelectTrigger className="bg-background/60 shadow-inner focus:ring-1 transition-all">
									<SelectValue placeholder="Select a school" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									{schools.map((school) => (
										<SelectItem
											key={school.school_id}
											value={school.school_id.toString()}
										>
											{school.school_name} (
											{school.school_code})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit_description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
								Description (Optional)
							</Label>
							<Input
								id="edit_description"
								placeholder="Department description"
								value={editFormData.description || ""}
								onChange={(e) =>
									setEditFormData({
										...editFormData,
										description: e.target.value,
									})
								}
								className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
							/>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => {
								setIsEditDialogOpen(false);
								setSelectedDepartment(null);
							}}
							className="active:scale-95 duration-200 transition-all"
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateDepartment}
							disabled={isSubmitting}
							className="active:scale-95 duration-200 transition-all bg-indigo-600 hover:bg-indigo-700 text-white"
						>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
