import { DataTable } from "@/features/shared/DataTable";
import { Building2, Users, BookOpen, GraduationCap, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { DeanDepartment } from "@/services/api";
import { deanApi } from "@/services/api/dean";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { useMemo, useState } from "react";
import { getDeanDepartmentColumns } from "./DepartmentsView.columns";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function DepartmentsView() {
	const {
		data: departments,
		loading,
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
		sort,
		sortDir,
		setSort,
		setLimit,
	} = usePaginatedData<DeanDepartment, { hod_status: string }>({
		fetchFn: (params) => deanApi.getAllDepartments(params),
		limit: 20,
		defaultSort: "d.department_code",
	});

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedDepartment, setSelectedDepartment] =
		useState<DeanDepartment | null>(null);
	const [formData, setFormData] = useState({
		department_name: "",
		department_code: "",
		description: "",
	});
	const [editFormData, setEditFormData] = useState({
		department_name: "",
		department_code: "",
		description: "",
	});

	const openEditDialog = (department: DeanDepartment) => {
		setSelectedDepartment(department);
		setEditFormData({
			department_name: department.department_name,
			department_code: department.department_code,
			description: "",
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteDepartment = async (department: DeanDepartment) => {
		try {
			await deanApi.deleteDepartment(department.department_id);
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
			getDeanDepartmentColumns({
				onEdit: openEditDialog,
				onDelete: handleDeleteDepartment,
			}),
		[],
	);

	const resetForm = () => {
		setFormData({
			department_name: "",
			department_code: "",
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
			await deanApi.createDepartment({
				department_name: formData.department_name,
				department_code: formData.department_code.toUpperCase(),
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
			await deanApi.updateDepartment(
				selectedDepartment.department_id,
				{
					department_name: editFormData.department_name,
					department_code: editFormData.department_code.toUpperCase(),
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
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-indigo-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-200">
								<Building2 className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
									{pagination?.total ?? "—"}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Total Departments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-cyan-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
								<Users className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
									{departments.reduce(
										(sum, d) =>
											sum + (d.faculty_count ?? 0),
										0,
									)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Faculty (this page)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
								<BookOpen className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
									{departments.reduce(
										(sum, d) => sum + (d.course_count ?? 0),
										0,
									)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Courses (this page)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 to-amber-500"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform duration-200">
								<GraduationCap className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
									{departments.reduce(
										(sum, d) =>
											sum + (d.student_count ?? 0),
										0,
									)}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Students (this page)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Departments Table */}
			<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-teal-500 to-transparent"></div>
				<CardHeader className="pb-4 border-b bg-muted/[.06] pt-5 flex flex-row items-center justify-between flex-wrap gap-4">
					<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
						<div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
							<Building2 className="w-4 h-4" />
						</div>
						All Departments
					</CardTitle>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2 active:scale-95 duration-200 transition-all shadow-md hover:shadow-indigo-500/10 h-9">
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
									Create a new department in your school
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
												department_name: e.target.value,
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
												department_code: e.target.value.toUpperCase(),
											})
										}
										className="bg-background/60 shadow-inner focus-visible:ring-1 transition-all"
									/>
									<p className="text-[10px] text-muted-foreground">
										Short code (max 10 characters), will be auto-capitalized
									</p>
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
									{isSubmitting ? "Creating..." : "Create Department"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent className="pt-6">
					<DataTable
						columns={columns}
						data={departments}
						searchPlaceholder="Filter departments..."
						refreshing={loading}
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
							sort,
							sortDir,
							setSort,
							onLimitChange: setLimit,
						}}
					>
						<Select
							value={filters.hod_status || "all"}
							onValueChange={(value) =>
								setFilter(
									"hod_status",
									value === "all" ? undefined : value,
								)
							}
						>
							<SelectTrigger className="h-9 w-[180px]">
								<SelectValue placeholder="HOD Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All HOD Status
								</SelectItem>
								<SelectItem value="assigned">
									Assigned
								</SelectItem>
								<SelectItem value="unassigned">
									Unassigned
								</SelectItem>
							</SelectContent>
						</Select>
					</DataTable>
				</CardContent>
			</Card>

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
