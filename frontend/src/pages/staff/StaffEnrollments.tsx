import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { AppHeader } from "@/components/layout";
import { StudentList } from "@/features/users/StudentList";
import { staffApi } from "@/services/api/staff";
import type { Programme } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";

export function StaffEnrollments() {
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [selectedProgId, setSelectedProgId] = useState<string>("all");
	const [loadingProgrammes, setLoadingProgrammes] = useState(false);

	useEffect(() => {
		const fetchProgrammes = async () => {
			setLoadingProgrammes(true);
			try {
				const resp = await staffApi.getDepartmentProgrammes({ limit: 100 });
				setProgrammes(resp.data || []);
			} catch (error) {
				console.error("Failed to load department programmes:", error);
			} finally {
				setLoadingProgrammes(false);
			}
		};
		fetchProgrammes();
	}, []);

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="Programme Enrollments"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				{/* Programme Selection */}
				<Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-lg relative">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-orange-500"></div>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							<GraduationCap className="h-5 w-5 text-amber-500" />
							Department Programmes
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-0.5">
							View and filter enrolled students by academic programme
						</p>
					</CardHeader>
					<CardContent>
						<Select
							value={selectedProgId}
							onValueChange={setSelectedProgId}
							disabled={loadingProgrammes}
						>
							<SelectTrigger className="w-full md:w-[350px] bg-background/60 shadow-inner focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl border-muted/50 h-10">
								<SelectValue placeholder="Select a programme to view enrollments" />
							</SelectTrigger>
							<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
								<SelectItem value="all" className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg py-2">
									All Programmes
								</SelectItem>
								{programmes.map((prog) => (
									<SelectItem
										key={prog.programme_id}
										value={prog.programme_id.toString()}
										className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg py-2"
									>
										<span className="font-mono mr-2 font-semibold text-amber-600 dark:text-amber-400">
											{prog.programme_code}
										</span>
										<span className="text-muted-foreground font-medium">- {prog.programme_name}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Enrolled Students Table */}
				<StudentList
					key={selectedProgId}
					fetchFn={(params) =>
						staffApi.getDepartmentStudents({
							...params,
							...(selectedProgId !== "all" && {
								programme_id: selectedProgId,
							}),
						})
					}
					title={
						selectedProgId === "all"
							? "All Department Students"
							: `Students Enrolled in ${
									programmes.find(
										(p) =>
											p.programme_id.toString() ===
											selectedProgId,
									)?.programme_name || ""
							  }`
					}
					permissions={{
						canEdit: false,
						canDelete: false,
						canViewDepartment: false,
						allowDepartmentFilter: false,
					}}
					showEnrolledCourses={true}
					showPhone={true}
					pageSize={20}
				/>
			</div>
		</div>
	);
}
