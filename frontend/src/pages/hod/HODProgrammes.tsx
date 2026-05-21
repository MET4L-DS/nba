import { useState, useCallback, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Plus, GraduationCap, BookOpen, Award, Clock } from "lucide-react";
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

	// Executive department stats state
	const [stats, setStats] = useState({ total: 0, ug: 0, pg: 0, durationAvg: 0 });
	const [statsLoading, setStatsLoading] = useState(true);

	useEffect(() => {
		setStatsLoading(true);
		hodApi.getDepartmentProgrammes({ limit: 100 })
			.then((res) => {
				const list = res.data ?? [];
				const ug = list.filter((p) => p.degree_level === "UG").length;
				const pg = list.filter((p) => p.degree_level === "PG" || p.degree_level === "PhD" || p.degree_level === "Diploma").length;
				const totalDuration = list.reduce((acc, curr) => acc + curr.duration_years, 0);
				const avg = list.length > 0 ? totalDuration / list.length : 0;
				setStats({
					total: list.length,
					ug,
					pg,
					durationAvg: avg,
				});
			})
			.catch((err) => {
				console.error("Failed to load department stats:", err);
			})
			.finally(() => {
				setStatsLoading(false);
			});
	}, [refreshKey]);

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
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background/50">
			<AppHeader
				title="Programmes Catalog"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				{/* Executive Stats Overview */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card className="p-4 bg-card/75 backdrop-blur-sm border border-muted/50 rounded-xl shadow-sm relative overflow-hidden flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
						<div className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full bg-blue-500"></div>
						<div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 shadow-inner">
							<BookOpen className="w-5 h-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Programmes</p>
							<p className="text-2xl font-extrabold tracking-tight mt-0.5 text-foreground">{statsLoading ? "—" : stats.total}</p>
						</div>
					</Card>
					<Card className="p-4 bg-card/75 backdrop-blur-sm border border-muted/50 rounded-xl shadow-sm relative overflow-hidden flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
						<div className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full bg-emerald-500"></div>
						<div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-inner">
							<GraduationCap className="w-5 h-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">UG Catalog</p>
							<p className="text-2xl font-extrabold tracking-tight mt-0.5 text-foreground">{statsLoading ? "—" : stats.ug}</p>
						</div>
					</Card>
					<Card className="p-4 bg-card/75 backdrop-blur-sm border border-muted/50 rounded-xl shadow-sm relative overflow-hidden flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
						<div className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full bg-purple-500"></div>
						<div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0 shadow-inner">
							<Award className="w-5 h-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PG Catalog</p>
							<p className="text-2xl font-extrabold tracking-tight mt-0.5 text-foreground">{statsLoading ? "—" : stats.pg}</p>
						</div>
					</Card>
					<Card className="p-4 bg-card/75 backdrop-blur-sm border border-muted/50 rounded-xl shadow-sm relative overflow-hidden flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
						<div className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full bg-amber-500"></div>
						<div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 shadow-inner">
							<Clock className="w-5 h-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Duration</p>
							<p className="text-2xl font-extrabold tracking-tight mt-0.5 text-foreground">{statsLoading ? "—" : `${stats.durationAvg.toFixed(1)} Yrs`}</p>
						</div>
					</Card>
				</div>

				<Tabs
					value={activeTab}
					onValueChange={(v) =>
						setActiveTab(v as "ongoing" | "offered" | "catalog")
					}
					className="w-full"
				>
					<div className="flex flex-wrap gap-4 items-center justify-between mb-4 bg-card/40 border border-muted/50 rounded-xl p-2 backdrop-blur-sm">
						<TabsList className="bg-muted/50 p-1 rounded-lg">
							<TabsTrigger value="ongoing" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">On-going</TabsTrigger>
							<TabsTrigger value="offered" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">Offered</TabsTrigger>
							<TabsTrigger value="catalog" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">Catalog</TabsTrigger>
						</TabsList>
						<Dialog
							open={isAddDialogOpen}
							onOpenChange={setIsAddDialogOpen}
						>
							<DialogTrigger asChild>
								<Button className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs py-2 px-4 rounded-lg shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95 duration-200">
									<Plus className="w-4 h-4" />
									Add Programme
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[450px] rounded-xl border border-muted/50 backdrop-blur-lg">
								<DialogHeader>
									<DialogTitle className="font-bold text-lg text-foreground">Add New Programme</DialogTitle>
									<DialogDescription className="text-xs text-muted-foreground mt-1">
										Create a new academic programme for your department Catalog.
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
					<DialogContent className="sm:max-w-[450px] rounded-xl border border-muted/50 backdrop-blur-lg">
						<DialogHeader>
							<DialogTitle className="font-bold text-lg text-foreground">Edit Programme</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground mt-1">
								Update academic programme details in your Catalog.
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
								className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs py-2 px-4 rounded-lg shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95 duration-200"
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
