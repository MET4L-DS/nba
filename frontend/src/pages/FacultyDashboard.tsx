import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { FacultyAssessments } from "@/components/faculty/FacultyAssessments";
import { FacultyMarks } from "@/components/faculty/FacultyMarks";
import { FacultyCOPO } from "@/components/faculty/FacultyCOPO";
import { AppSidebar, AppHeader, type NavItem } from "@/components/layout";
import { apiService } from "@/services/api";
import type { User, Course } from "@/services/api";
import { ClipboardList, FileCheck, Network, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const facultyNavItems: NavItem[] = [
	{ id: "assessments", label: "Assessments", icon: ClipboardList },
	{ id: "marks", label: "Marks Entry", icon: FileCheck },
	{ id: "copo", label: "CO-PO Mapping", icon: Network },
];

export function FacultyDashboard() {
	const [user, setUser] = useState<User | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [courses, setCourses] = useState<Course[]>([]);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [activeView, setActiveView] = useState<
		"assessments" | "marks" | "copo"
	>("assessments");
	const navigate = useNavigate();

	useEffect(() => {
		const storedUser = apiService.getStoredUser();
		if (!storedUser) {
			navigate("/login");
			return;
		}
		if (storedUser.role !== "faculty" && storedUser.role !== "hod") {
			// Allow HOD to access this dashboard too if they want, or redirect?
			// Usually strict role check. But user said HOD reuses components.
			// For now, let's stick to faculty role check or redirect to respective dashboard.
			// If HOD logs in, they go to /hod. If they navigate here manually, maybe allow?
			// Let's assume this is primarily for Faculty role.
			if (storedUser.role === "admin") {
				navigate("/dashboard");
				return;
			}
			if (storedUser.role === "dean") {
				navigate("/dean");
				return;
			}
			if (storedUser.role === "staff") {
				navigate("/staff");
				return;
			}
			// If HOD, they might want to see this view for their own courses.
		}
		setUser(storedUser);
		loadCourses();
	}, [navigate]);

	const loadCourses = async () => {
		try {
			const coursesData = await apiService.getCourses();
			setCourses(coursesData);
			// Auto-select first course if available and none selected
			if (coursesData.length > 0 && !selectedCourse) {
				setSelectedCourse(coursesData[0]);
			}
		} catch (error) {
			console.error("Failed to load courses:", error);
		}
	};

	const handleLogout = async () => {
		await apiService.logout();
		navigate("/login");
	};

	if (!user) {
		return null;
	}

	return (
		<>
			<Toaster />
			<div className="flex h-screen bg-gray-50 dark:bg-gray-950">
				<AppSidebar
					items={facultyNavItems}
					user={user}
					activeId={activeView}
					onNavigate={(id) =>
						setActiveView(id as "assessments" | "marks" | "copo")
					}
					onLogout={handleLogout}
					sidebarOpen={sidebarOpen}
				/>

				<div className="flex-1 flex flex-col overflow-hidden">
					<AppHeader
						sidebarOpen={sidebarOpen}
						onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
						title="Faculty Dashboard"
						description="Manage assessments, marks, and CO-PO mapping."
					>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="w-[250px] justify-between"
								>
									{selectedCourse
										? `${selectedCourse.course_code} - ${selectedCourse.name}`
										: "Select Course"}
									<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-[250px]">
								{courses.map((course) => (
									<DropdownMenuItem
										key={course.id}
										onSelect={() =>
											setSelectedCourse(course)
										}
									>
										{course.course_code} - {course.name}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</AppHeader>

					<main className="flex-1 overflow-hidden">
						{activeView === "assessments" && (
							<FacultyAssessments
								selectedCourse={selectedCourse}
							/>
						)}
						{activeView === "marks" && (
							<FacultyMarks selectedCourse={selectedCourse} />
						)}
						{activeView === "copo" && (
							<FacultyCOPO
								selectedCourse={selectedCourse}
								user={user}
							/>
						)}
					</main>
				</div>
			</div>
		</>
	);
}
