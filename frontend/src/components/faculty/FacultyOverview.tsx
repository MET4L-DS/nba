import { ConcludeCourseDialog } from "./ConcludeCourseDialog";
import { useState, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp } from "lucide-react";
import type { Course } from "@/services/api";
import { DataTable } from "@/features/shared/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { facultyApi } from "@/services/api/faculty";
import { toast } from "sonner";
import { OfferingTestAverages } from "./OfferingTestAverages";
import { getFacultyOverviewColumns } from "./FacultyOverview.columns";

interface FacultyOverviewProps {
	courses: Course[];
	isLoading: boolean;
	onRefresh?: () => void;
}

export const FacultyOverview = memo(function FacultyOverview({
	courses,
	isLoading,
	onRefresh,
}: FacultyOverviewProps) {
	const [concludeData, setConcludeData] = useState<{
		isOpen: boolean;
		course: Course | null;
		isConcluding: boolean;
		canConclude: boolean;
		incompleteTests: string[];
	}>({
		isOpen: false,
		course: null,
		isConcluding: false,
		canConclude: true,
		incompleteTests: [],
	});

	const handleConcludeCourse = useCallback(async () => {
		if (!concludeData.course || !concludeData.canConclude) return;
		const offeringId =
			concludeData.course.offering_id || concludeData.course.course_id;

		setConcludeData((prev) => ({ ...prev, isConcluding: true }));

		try {
			await facultyApi.concludeCourse(offeringId);
			toast.success("Course session concluded successfully", {
				description: "Rollbacks are not possible. Session deactivated.",
			});
			setConcludeData({
				isOpen: false,
				course: null,
				isConcluding: false,
				canConclude: true,
				incompleteTests: [],
			});
			if (onRefresh) onRefresh();
		} catch (error) {
			console.error("Failed to conclude course", error);
			toast.error("Failed to conclude course", {
				description:
					"You might not be authorized or the server encountered an error.",
			});
			setConcludeData((prev) => ({ ...prev, isConcluding: false }));
		}
	}, [concludeData.course, concludeData.canConclude, onRefresh]);

	const openConcludeDialog = useCallback(async (course: Course) => {
		const offeringId = course.offering_id || course.course_id;
		try {
			const status =
				await facultyApi.checkCourseCompletionStatus(offeringId);
			setConcludeData({
				isOpen: true,
				course,
				isConcluding: false,
				canConclude: status.can_conclude,
				incompleteTests: status.incomplete_tests,
			});
		} catch (error) {
			console.error("Failed to check course status", error);
			toast.error("Failed to check course status");
		}
	}, []);

	const columns = useMemo(
		() => getFacultyOverviewColumns(openConcludeDialog),
		[openConcludeDialog],
	);

	const activeCourses = useMemo(
		() => courses.filter((c) => c.is_active !== 0),
		[courses],
	);
	const pastCourses = useMemo(
		() => courses.filter((c) => c.is_active === 0),
		[courses],
	);

	const renderSubRow = useCallback((row: any) => {
		const offeringId = row.original.offering_id;
		if (!offeringId) return null;
		return <OfferingTestAverages offeringId={offeringId} />;
	}, []);

	return (
		<div className="space-y-6">
			{/* Course List */}
			<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent"></div>
				<CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-muted/[.06] pt-6">
					<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
						<div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner text-blue-600 dark:text-blue-400">
							<BookOpen className="w-5 h-5" />
						</div>
						<div>
							<span>My Assigned Courses</span>
							<p className="text-xs text-muted-foreground mt-0.5 font-normal">
								Track current offerings and finalize past course mappings.
							</p>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<Tabs defaultValue="active" className="w-full">
						<div className="flex flex-wrap gap-4 items-center justify-between mb-4 bg-card/40 border border-muted/50 rounded-xl p-2 backdrop-blur-sm w-fit">
							<TabsList className="bg-muted/50 p-1 rounded-lg">
								<TabsTrigger value="active" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
									Active Courses ({activeCourses.length})
								</TabsTrigger>
								<TabsTrigger value="past" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
									Course History ({pastCourses.length})
								</TabsTrigger>
							</TabsList>
						</div>
						<TabsContent value="active" className="mt-0">
							<DataTable
								columns={columns}
								data={activeCourses}
								refreshing={isLoading}
								renderSubRow={renderSubRow}
							/>
						</TabsContent>
						<TabsContent value="past" className="mt-0">
							<DataTable
								columns={columns}
								data={pastCourses}
								refreshing={isLoading}
								renderSubRow={renderSubRow}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Performance Insights */}
			<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent"></div>
				<CardHeader className="pb-4 border-b bg-muted/[.06] pt-6">
					<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
						<div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner text-emerald-600 dark:text-emerald-400">
							<TrendingUp className="w-5 h-5" />
						</div>
						<div>
							<span>Performance Insights</span>
							<p className="text-xs text-muted-foreground mt-0.5 font-normal">
								General metrics for overall registered credit loads and semester catalogs.
							</p>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="p-4 bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-inner">
							<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
								Total Courses
							</p>
							<p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
								{courses.length}
							</p>
						</div>
						<div className="p-4 bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 rounded-xl shadow-inner">
							<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
								Active Semester
							</p>
							<p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
								{courses[0]?.semester ?? "N/A"}
							</p>
						</div>
						<div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-inner">
							<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
								Total Credits
							</p>
							<p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
								{courses.reduce((sum, c) => sum + c.credit, 0)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<ConcludeCourseDialog
				open={concludeData.isOpen}
				onOpenChange={(open: boolean) =>
					!concludeData.isConcluding &&
					setConcludeData((prev) => ({ ...prev, isOpen: open }))
				}
				canConclude={concludeData.canConclude}
				isConcluding={concludeData.isConcluding}
				course={concludeData.course}
				incompleteTests={concludeData.incompleteTests}
				onConclude={handleConcludeCourse}
			/>
		</div>
	);
});
