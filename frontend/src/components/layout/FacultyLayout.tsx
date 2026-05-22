import { useState, useEffect } from "react";
import { useOutletContext, Outlet, useLocation } from "react-router-dom";
import { facultyApi } from "@/services/api/faculty";
import { apiService } from "@/services/api";
import type { Course, User } from "@/services/api";
import { AppHeader } from "@/components/layout";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw } from "lucide-react";
import { debugLogger } from "@/lib/debugLogger";

export function FacultyLayout() {
	const location = useLocation();
	const { user, sidebarOpen, setSidebarOpen } = useOutletContext<{
		user: User;
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	debugLogger.info("FacultyLayout", "Layout mounted", { user: user?.username });

	// Fetch courses once at layout level
	const {
		data: courses,
		loading: isLoadingCourses,
		refresh: refreshCourses,
	} = usePaginatedData<Course>({
		fetchFn: facultyApi.getCourses,
		limit: 100,
	});

	debugLogger.debug("FacultyLayout", "Courses loaded", { count: courses.length });

	// Filter active courses
	const activeCourses = courses.filter((c) => c.is_active !== 0);

	const [selectedCourse, setSelectedCourseState] = useState<Course | null>(null);

	const setSelectedCourse = (course: Course | null) => {
		setSelectedCourseState(course);
		if (course) {
			localStorage.setItem(
				"faculty_last_course",
				String(course.offering_id || course.course_id || ""),
			);
			debugLogger.info("FacultyLayout", "Selected course updated", {
				courseCode: course.course_code,
				offeringId: course.offering_id,
			});
		}
	};

	// Synchronize or restore course selection
	useEffect(() => {
		if (courses.length > 0 && !selectedCourse) {
			let activeCourse = courses.find((c) => c.is_active !== 0) || courses[0];
			const savedCourseId = localStorage.getItem("faculty_last_course");

			if (savedCourseId) {
				const foundCourse = courses.find(
					(c) => String(c.offering_id || c.course_id) === savedCourseId,
				);
				if (foundCourse) {
					activeCourse = foundCourse;
					debugLogger.info("FacultyLayout", "Restored course from localStorage", {
						courseCode: foundCourse.course_code,
					});
				}
			}
			setSelectedCourse(activeCourse);
		}
	}, [courses, selectedCourse]);

	// Dynamically calculate page title based on route
	const getHeaderTitle = () => {
		const path = location.pathname;
		if (path.endsWith("/faculty/assessments")) return "Assessments";
		if (path.endsWith("/faculty/students")) return "Enrolled Students";
		if (path.endsWith("/faculty/marks")) return "Marks Entry";
		if (path.endsWith("/faculty/survey")) return "Course Exit Survey";
		if (path.endsWith("/faculty/copo")) return "CO-PO Mapping";
		if (path.endsWith("/faculty/logs")) return "My Audit Logs";
		return "Faculty Dashboard";
	};

	// Determine if course dropdown should be visible
	const showCourseDropdown = !location.pathname.endsWith("/faculty/logs");

	const handleRefresh = () => {
		refreshCourses({ bypassCache: true });
	};

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<AppHeader
				title={getHeaderTitle()}
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				onLogout={async () => {
					await apiService.logout().catch(() => {});
					window.location.href = "/login";
				}}
			>
				<div className="flex items-center gap-2">
					{showCourseDropdown && courses.length > 0 && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="hover:bg-primary/[0.02] active:scale-95 duration-200"
								>
									{selectedCourse
										? selectedCourse.course_code
										: "Select Course"}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{courses.map((course) => (
									<DropdownMenuItem
										key={course.offering_id || course.course_id}
										onClick={() => setSelectedCourse(course)}
										className="font-medium cursor-pointer"
									>
										{course.course_code} - {course.course_name}
										{course.is_active === 0 ? " (Locked)" : ""}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					<Button
						variant="outline"
						size="icon"
						onClick={handleRefresh}
						disabled={isLoadingCourses}
						className="hover:bg-primary/[0.04] hover:text-primary transition-all duration-200 active:scale-95 h-8 w-8 shrink-0"
					>
						<RefreshCw
							className={`h-4 w-4 ${isLoadingCourses ? "animate-spin" : ""}`}
						/>
					</Button>
				</div>
			</AppHeader>

			<div className="flex-1 overflow-hidden flex flex-col relative bg-zinc-50/40 dark:bg-background/25">
				<Outlet
					context={{
						user,
						sidebarOpen,
						setSidebarOpen,
						courses,
						activeCourses,
						selectedCourse,
						setSelectedCourse,
						isLoadingCourses,
						refreshCourses,
					}}
				/>
			</div>
		</div>
	);
}
