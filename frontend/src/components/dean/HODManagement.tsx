import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/features/shared/DataTable";
import { Building2, UserPlus, UserMinus, History } from "lucide-react";
import { toast } from "sonner";
import { deanApi, type DeanDepartment } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAppointmentOrder } from "@/utils/appointmentUtils";
import { getStatusColumns, getHistoryColumns } from "./HODManagement.columns";

interface HODManagementProps {
	departments: DeanDepartment[];
	isLoading: boolean;
	onSuccess?: () => void;
}

export function HODManagement({
	departments,
	isLoading,
	onSuccess,
}: HODManagementProps) {
	const queryClient = useQueryClient();

	const [selectedDepartment, setSelectedDepartment] =
		useState<DeanDepartment | null>(null);
	const [appointDialogOpen, setAppointDialogOpen] = useState(false);
	const [selectedFaculty, setSelectedFaculty] = useState<string>("");
	const [appointmentOrder, setAppointmentOrder] = useState("");

	// Auto-generate appointment order when dialog opens and department is selected
	useEffect(() => {
		if (appointDialogOpen && selectedDepartment) {
			setAppointmentOrder(
				generateAppointmentOrder(
					"HOD",
					selectedDepartment.department_id,
				),
			);
		}
	}, [appointDialogOpen, selectedDepartment]);

	// Fetch faculty members for a department
	const { data: facultyMembers = [], isLoading: loadingFaculty } = useQuery({
		queryKey: ["departmentFaculty", selectedDepartment?.department_id],
		queryFn: () =>
			selectedDepartment
				? deanApi.getDepartmentFaculty(selectedDepartment.department_id)
				: Promise.resolve([]),
		enabled: appointDialogOpen && !!selectedDepartment,
	});

	// Fetch HOD assignment history
	const {
		data: hodHistory = [],
		isLoading: loadingHistory,
		refetch: refetchHistory,
	} = useQuery({
		queryKey: ["hodHistory"],
		queryFn: () => deanApi.getHODHistory(),
	});

	// Appoint HOD mutation
	const appointMutation = useMutation({
		mutationFn: ({
			departmentId,
			data,
		}: {
			departmentId: number;
			data: any;
		}) => deanApi.appointHOD(departmentId, data),
		onError: (error: any) => {
			toast.error(error?.message || "Failed to appoint HOD");
		},
	});

	// Demote HOD mutation
	const demoteMutation = useMutation({
		mutationFn: (employeeId: number) => deanApi.demoteHOD(employeeId),
		onError: (error: any) => {
			toast.error(error?.message || "Failed to demote HOD");
		},
	});

	const resetForm = () => {
		setSelectedFaculty("");
		setAppointmentOrder("");
	};

	const handleAppointClick = (department: DeanDepartment) => {
		setSelectedDepartment(department);
		setAppointDialogOpen(true);
	};

	const handleDemoteClick = (department: DeanDepartment) => {
		setSelectedDepartment(department);
		// Open appoint dialog for replacement
		setAppointDialogOpen(true);
	};

	const handleAppointSubmit = async () => {
		if (!selectedDepartment) return;

		const isReplacing = !!selectedDepartment.hod_employee_id;

		try {
			// If replacing, demote current HOD first
			if (isReplacing) {
				if (!selectedDepartment.hod_employee_id) {
					console.error("Missing HOD ID", selectedDepartment);
					toast.error(
						"Cannot replace: HOD employee ID is missing from department data",
					);
					return;
				}
				toast.info("Ending current HOD assignment...");
				await demoteMutation.mutateAsync(
					selectedDepartment.hod_employee_id,
				);
				toast.success("Previous serving HOD record ended");
			}

			if (!selectedFaculty || !appointmentOrder.trim()) {
				toast.error(
					"Please select a faculty member and enter appointment order",
				);
				return;
			}
			await appointMutation.mutateAsync({
				departmentId: selectedDepartment.department_id,
				data: {
					employee_id: parseInt(selectedFaculty),
					appointment_order: appointmentOrder,
				},
			});

			// Both steps succeeded — show toast, refresh, close dialog
			toast.success(
				isReplacing
					? "Serving HOD replaced successfully"
					: "Serving HOD recorded successfully",
			);
			queryClient.invalidateQueries({ queryKey: ["deanDepartments"] });
			queryClient.invalidateQueries({ queryKey: ["deanUsers"] });
			queryClient.invalidateQueries({ queryKey: ["hodHistory"] });
			if (onSuccess) onSuccess();
			setAppointDialogOpen(false);
			resetForm();
		} catch (error: any) {
			console.error("HOD operation failed:", error);
			// onError handlers in mutations already show individual toasts
		}
	};

	const statusColumns = useMemo(
		() =>
			getStatusColumns({
				onAppointClick: handleAppointClick,
				onDemoteClick: handleDemoteClick,
			}),
		[],
	);

	const historyColumns = useMemo(() => getHistoryColumns(), []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	const departmentsWithoutHOD = departments.filter((d) => !d.hod_name);
	const departmentsWithHOD = departments.filter((d) => d.hod_name);

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-6 md:grid-cols-3">
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-teal-500 to-transparent"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
								<Building2 className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
									{departments.length}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Total Departments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
								<UserPlus className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
									{departmentsWithHOD.length}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Departments with HOD
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent"></div>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-200">
								<UserMinus className="w-6 h-6" />
							</div>
							<div>
								<p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
									{departmentsWithoutHOD.length}
								</p>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
									Departments without HOD
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs: HOD Status + Assignment History */}
			<Tabs defaultValue="status" className="w-full">
				<div className="flex flex-wrap gap-4 items-center justify-between mb-4 bg-card/40 border border-muted/50 rounded-xl p-2 backdrop-blur-sm w-fit">
					<TabsList className="bg-muted/50 p-1 rounded-lg">
						<TabsTrigger value="status" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
							<Building2 className="w-4 h-4 mr-2 text-blue-500" />
							HOD Status
						</TabsTrigger>
						<TabsTrigger
							value="history"
							onClick={() => refetchHistory()}
							className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
						>
							<History className="w-4 h-4 mr-2 text-teal-500" />
							Assignment History
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="status" className="mt-0">
					<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
						<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-teal-500 to-transparent"></div>
						<CardHeader className="pb-4 border-b bg-muted/[.06] pt-5">
							<CardTitle className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
								Department HOD Status
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<DataTable
								columns={statusColumns}
								data={departments}
								refreshing={isLoading}
								searchPlaceholder="Search departments..."
								searchKey="department_name"
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" className="mt-0">
					<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
						<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-blue-500 to-transparent"></div>
						<CardHeader className="pb-4 border-b bg-muted/[.06] pt-5">
							<CardTitle className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
								HOD Assignment History
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							{loadingHistory ? (
								<div className="flex items-center justify-center h-32">
									<History className="animate-spin h-6 w-6 text-teal-500 mr-2" />
									<span className="text-muted-foreground">Loading history...</span>
								</div>
							) : (
								<DataTable
									columns={historyColumns}
									data={hodHistory}
									refreshing={loadingHistory}
									searchPlaceholder="Search by name or department..."
									searchKey="username"
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Appoint HOD Dialog */}
			<Dialog
				open={appointDialogOpen}
				onOpenChange={setAppointDialogOpen}
			>
				<DialogContent className="max-w-md border border-muted/50 bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-teal-500"></div>
					<DialogHeader className="pt-2">
						<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							{selectedDepartment?.hod_name
								? "Assign New HOD"
								: "Record Serving HOD"}
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground/90 mt-1">
							{selectedDepartment?.hod_name
								? `Assign new HOD (replacing ${selectedDepartment.hod_name}) for ${selectedDepartment.department_name}`
								: `Record the serving Head of Department for ${selectedDepartment?.department_name}`}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-5 pt-3">
						<div className="space-y-2">
							<Label htmlFor="appointment-order" className="text-sm font-semibold text-foreground/90">
								Appointment Order No.
							</Label>
							<Input
								id="appointment-order"
								value={appointmentOrder}
								onChange={(e) =>
									setAppointmentOrder(e.target.value)
								}
								placeholder="e.g. ORD/HOD/2026/01"
								className="border-muted/65 focus-visible:ring-blue-500/50 rounded-lg"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-semibold text-foreground/90">Select Faculty / Staff Member</Label>
							{loadingFaculty ? (
								<div className="text-sm text-muted-foreground flex items-center gap-2 py-1">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent"></span>
									Loading members...
								</div>
							) : facultyMembers.length === 0 ? (
								<div className="text-sm text-muted-foreground py-1">
									No faculty members available in this department
								</div>
							) : (
								<Select
									value={selectedFaculty}
									onValueChange={(value) =>
										setSelectedFaculty(value)
									}
								>
									<SelectTrigger className="border-muted/65 focus:ring-blue-500/50 rounded-lg">
										<SelectValue placeholder="Choose a faculty member" />
									</SelectTrigger>
									<SelectContent className="border-muted/50">
										{facultyMembers.map(
											(faculty: {
												employee_id: number;
												username: string;
												email: string;
											}) => (
												<SelectItem
													key={faculty.employee_id}
													value={faculty.employee_id.toString()}
												>
													{faculty.username} ({faculty.email})
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							)}
						</div>

						<div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4 text-xs text-muted-foreground leading-relaxed">
							<strong className="text-blue-600 dark:text-blue-400 block mb-1">Record-only Assignment</strong>
							This is a record-only assignment. The selected
							member will be recorded as the serving HOD. Their
							login role will NOT change — the HOD interface is
							always accessed via the dedicated HOD account
							(e.g.&nbsp;hod_cse@tezu.ac.in).
						</div>

						<div className="flex gap-3 pt-3">
							<Button
								variant="outline"
								onClick={() => {
									setAppointDialogOpen(false);
									resetForm();
								}}
								className="flex-1 border-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200 active:scale-95 rounded-lg"
							>
								Cancel
							</Button>
							<Button
								onClick={handleAppointSubmit}
								disabled={
									appointMutation.isPending ||
									demoteMutation.isPending
								}
								className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 border-none rounded-lg"
							>
								{appointMutation.isPending ||
								demoteMutation.isPending ? (
									<span className="flex items-center justify-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
										Processing...
									</span>
								) : selectedDepartment?.hod_name ? (
									"Assign New HOD"
								) : (
									"Record Serving HOD"
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
