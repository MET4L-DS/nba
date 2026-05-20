import { useState, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { hodApi } from "@/services/api/hod";
import type { Programme, PaginationParams } from "@/services/api";
import { ProgrammeList } from "@/features/programmes/ProgrammeList";

const currentYear = new Date().getFullYear();

export function HODProgrammes() {
	const navigate = useNavigate();
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const [activeTab, setActiveTab] = useState<
		"ongoing" | "offered" | "catalog"
	>("ongoing");

	// Dialog state
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedProgramme, setSelectedProgramme] =
		useState<Programme | null>(null);

	// Refresh trigger for ProgrammeList
	const [refreshKey, setRefreshKey] = useState(0);
	const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

	// View Attainment handler — uses batch_id from the programme row, fallback to latest_batch_year
	const handleViewAttainment = useCallback(
		(programme: Programme) => {
			navigate("/hod/programme-attainment", {
				state: {
					programmeId: programme.programme_id,
					programmeName: programme.programme_name,
					batchId: programme.batch_id ?? undefined,
					batchYear: programme.specific_batch_year
						? String(programme.specific_batch_year)
						: programme.latest_batch_year
							? String(programme.latest_batch_year)
							: String(currentYear),
				},
			});
		},
		[navigate],
	);

	// Form state
	const [formData, setFormData] = useState({
		programme_name: "",
		programme_code: "",
		degree_level: "UG" as Programme["degree_level"],
		duration_years: 4,
	});

	const [editFormData, setEditFormData] = useState({
		programme_name: "",
		programme_code: "",
		degree_level: "UG" as Programme["degree_level"],
		duration_years: 4,
	});

	// Dialog handlers
	const openEditDialog = (programme: Programme) => {
		setSelectedProgramme(programme);
		setEditFormData({
			programme_name: programme.programme_name,
			programme_code: programme.programme_code,
			degree_level: programme.degree_level,
			duration_years: programme.duration_years,
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteProgramme = async (programme: Programme) => {
		try {
			await hodApi.deleteProgramme(programme.programme_id);
			toast.success(`Programme "${programme.programme_name}" deleted`);
			triggerRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete programme",
			);
		}
	};

	const resetForm = () => {
		setFormData({
			programme_name: "",
			programme_code: "",
			degree_level: "UG",
			duration_years: 4,
		});
	};

	const handleCreateProgramme = async () => {
		if (!formData.programme_name || !formData.programme_code) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSubmitting(true);
		try {
			await hodApi.createProgramme({
				programme_name: formData.programme_name,
				programme_code: formData.programme_code.toUpperCase(),
				degree_level: formData.degree_level,
				duration_years: formData.duration_years,
			});
			toast.success("Programme created successfully");
			setIsAddDialogOpen(false);
			resetForm();
			triggerRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create programme",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateProgramme = async () => {
		if (!selectedProgramme) return;
		if (!editFormData.programme_name || !editFormData.programme_code) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSubmitting(true);
		try {
			await hodApi.updateProgramme(selectedProgramme.programme_id, {
				programme_name: editFormData.programme_name,
				programme_code: editFormData.programme_code.toUpperCase(),
				degree_level: editFormData.degree_level,
				duration_years: editFormData.duration_years,
			});
			toast.success("Programme updated successfully");
			setIsEditDialogOpen(false);
			setSelectedProgramme(null);
			triggerRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update programme",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const fetchOngoing = useCallback((params: PaginationParams) => {
		const now = new Date();
		// Assume academic year starts in July (month 6).
		// If it's before July, the current academic year started last year.
		const academicYear =
			now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();

		return hodApi.getDepartmentProgrammes({
			...params,
			year: String(academicYear),
			limit: 100,
		});
	}, []);

	const fetchOffered = useCallback((params: PaginationParams) => {
		const now = new Date();
		const academicYear =
			now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();

		return hodApi.getDepartmentProgrammes({
			...params,
			has_batches: "1",
			batch_year_max: String(academicYear),
			limit: 100,
		});
	}, []);

	const fetchAll = useCallback(
		(params: PaginationParams) =>
			hodApi.getDepartmentProgrammes({
				...params,
				limit: 100,
			}),
		[],
	);

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="Programmes"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				<Tabs
					value={activeTab}
					onValueChange={(v) =>
						setActiveTab(v as "ongoing" | "offered" | "catalog")
					}
					className="w-full"
				>
					<div className="flex items-center justify-between mb-4">
						<TabsList>
							<TabsTrigger value="ongoing">On-going</TabsTrigger>
							<TabsTrigger value="offered">Offered</TabsTrigger>
							<TabsTrigger value="catalog">Catalog</TabsTrigger>
						</TabsList>
						<Dialog
							open={isAddDialogOpen}
							onOpenChange={setIsAddDialogOpen}
						>
							<DialogTrigger asChild>
								<Button className="gap-2 bg-blue-600 hover:bg-blue-700">
									<Plus className="w-4 h-4" />
									Add Programme
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[450px]">
								<DialogHeader>
									<DialogTitle>Add New Programme</DialogTitle>
									<DialogDescription>
										Create a new academic programme for your
										department
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="programme_name">
											Programme Name *
										</Label>
										<Input
											id="programme_name"
											placeholder="e.g., Bachelor of Technology"
											value={formData.programme_name}
											onChange={(e) =>
												setFormData({
													...formData,
													programme_name:
														e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="programme_code">
											Programme Code *
										</Label>
										<Input
											id="programme_code"
											placeholder="e.g., BTECH"
											value={formData.programme_code}
											onChange={(e) =>
												setFormData({
													...formData,
													programme_code:
														e.target.value.toUpperCase(),
												})
											}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="degree_level">
												Degree Level
											</Label>
											<Select
												value={formData.degree_level}
												onValueChange={(val) =>
													setFormData({
														...formData,
														degree_level:
															val as Programme["degree_level"],
													})
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="UG">
														UG
													</SelectItem>
													<SelectItem value="PG">
														PG
													</SelectItem>
													<SelectItem value="Diploma">
														Diploma
													</SelectItem>
													<SelectItem value="PhD">
														PhD
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="duration_years">
												Duration (Years)
											</Label>
											<Input
												id="duration_years"
												type="number"
												min={1}
												max={10}
												value={formData.duration_years}
												onChange={(e) =>
													setFormData({
														...formData,
														duration_years:
															parseInt(
																e.target.value,
															),
													})
												}
											/>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => {
											setIsAddDialogOpen(false);
											resetForm();
										}}
									>
										Cancel
									</Button>
									<Button
										onClick={handleCreateProgramme}
										disabled={isSubmitting}
										className="bg-blue-600 hover:bg-blue-700"
									>
										{isSubmitting
											? "Creating..."
											: "Create Programme"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					<TabsContent value="ongoing" className="space-y-4">
						<ProgrammeList
							key={`ongoing-${refreshKey}`}
							fetchFn={fetchOngoing}
							title="On-going Batches"
							onEdit={openEditDialog}
							onDelete={handleDeleteProgramme}
							onViewAttainment={handleViewAttainment}
						/>
					</TabsContent>

					<TabsContent value="offered" className="space-y-4">
						<ProgrammeList
							key={`offered-${refreshKey}`}
							fetchFn={fetchOffered}
							title="Offered Programmes"
							onEdit={openEditDialog}
							onDelete={handleDeleteProgramme}
							onViewAttainment={handleViewAttainment}
						/>
					</TabsContent>

					<TabsContent value="catalog" className="space-y-4">
						<ProgrammeList
							key={`catalog-${refreshKey}`}
							fetchFn={fetchAll}
							title="Programme Catalog"
							onEdit={openEditDialog}
							onDelete={handleDeleteProgramme}
						/>
					</TabsContent>
				</Tabs>

				{/* Edit Dialog */}
				<Dialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
				>
					<DialogContent className="sm:max-w-[450px]">
						<DialogHeader>
							<DialogTitle>Edit Programme</DialogTitle>
							<DialogDescription>
								Update programme information
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="edit_programme_name">
									Programme Name *
								</Label>
								<Input
									id="edit_programme_name"
									value={editFormData.programme_name}
									onChange={(e) =>
										setEditFormData({
											...editFormData,
											programme_name: e.target.value,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit_programme_code">
									Programme Code *
								</Label>
								<Input
									id="edit_programme_code"
									value={editFormData.programme_code}
									onChange={(e) =>
										setEditFormData({
											...editFormData,
											programme_code:
												e.target.value.toUpperCase(),
										})
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit_degree_level">
										Degree Level
									</Label>
									<Select
										value={editFormData.degree_level}
										onValueChange={(val) =>
											setEditFormData({
												...editFormData,
												degree_level:
													val as Programme["degree_level"],
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="UG">
												UG
											</SelectItem>
											<SelectItem value="PG">
												PG
											</SelectItem>
											<SelectItem value="Diploma">
												Diploma
											</SelectItem>
											<SelectItem value="PhD">
												PhD
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit_duration_years">
										Duration (Years)
									</Label>
									<Input
										id="edit_duration_years"
										type="number"
										min={1}
										max={10}
										value={editFormData.duration_years}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												duration_years: parseInt(
													e.target.value,
												),
											})
										}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setIsEditDialogOpen(false);
									setSelectedProgramme(null);
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleUpdateProgramme}
								disabled={isSubmitting}
								className="bg-blue-600 hover:bg-blue-700"
							>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
