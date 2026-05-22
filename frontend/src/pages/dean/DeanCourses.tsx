import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { AppHeader } from "@/components/layout";
import { CourseList } from "@/features/courses";
import { deanApi } from "@/services/api/dean";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaginatedData } from "@/lib/usePaginatedData";
import type { DeanDepartment, Department } from "@/services/api";

const currentYear = new Date().getFullYear();
const currentSemester = new Date().getMonth() < 6 ? "Spring" : "Autumn";

export function DeanCourses() {
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const [activeTab, setActiveTab] = useState<"current" | "all">("current");

	// Load departments for the department filter dropdown
	const { data: departments } = usePaginatedData<DeanDepartment>({
		fetchFn: (params) => deanApi.getAllDepartments(params),
		limit: 100,
		defaultSort: "department_code",
	});

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title="All Courses"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>
			<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as "current" | "all")}
					className="w-full"
				>
					<div className="flex flex-wrap gap-4 items-center justify-between mb-4 bg-card/40 border border-muted/50 rounded-xl p-2 backdrop-blur-sm w-fit">
						<TabsList className="bg-muted/50 p-1 rounded-lg">
							<TabsTrigger value="current" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
								Current Semester
							</TabsTrigger>
							<TabsTrigger value="all" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
								All Offerings
							</TabsTrigger>
						</TabsList>
					</div>

					{/* Current Semester tab — year/semester fixed, so hide those columns */}
					<TabsContent value="current" className="space-y-4">
						<CourseList
							fetchFn={(params) =>
								deanApi.getAllCourses({
									...params,
									year: currentYear,
									semester: currentSemester,
								})
							}
							title={`All Courses — ${currentSemester} ${currentYear}`}
							permissions={{
								canViewDepartment: true,
								allowDepartmentFilter: true,
							}}
							availableFilters={[
								"department",
								"status",
								"type",
							]}
							departments={departments as unknown as Department[]}
							showYear={false}
							showSemester={false}
							showType={true}
							showStatus={true}
							showLevel={true}
						/>
					</TabsContent>

					{/* All Offerings tab — show all columns and all filters */}
					<TabsContent value="all" className="space-y-4">
						<CourseList
							fetchFn={(params) => deanApi.getAllCourses(params)}
							title="All Course Offerings"
							permissions={{
								canViewDepartment: true,
								allowDepartmentFilter: true,
							}}
							availableFilters={[
								"department",
								"year",
								"semester",
								"status",
								"type",
							]}
							departments={departments as unknown as Department[]}
							showYear={true}
							showSemester={true}
							showType={true}
							showStatus={true}
							showLevel={true}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
