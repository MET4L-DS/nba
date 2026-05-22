import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { FacultyLayout } from "./components/layout/FacultyLayout";
import { PageLoader } from "./components/ui/page-loader";

// Lazy-loaded Admin Pages
const AdminHome = lazy(() => import("./pages/admin/AdminHome").then(module => ({ default: module.AdminHome })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(module => ({ default: module.AdminUsers })));
const AdminSchools = lazy(() => import("./pages/admin/AdminSchools").then(module => ({ default: module.AdminSchools })));
const AdminDepartments = lazy(() => import("./pages/admin/AdminDepartments").then(module => ({ default: module.AdminDepartments })));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents").then(module => ({ default: module.AdminStudents })));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses").then(module => ({ default: module.AdminCourses })));
const AdminProgrammes = lazy(() => import("./pages/admin/AdminProgrammes").then(module => ({ default: module.AdminProgrammes })));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs").then(module => ({ default: module.AdminLogs })));

// Lazy-loaded HOD Pages
const HODHome = lazy(() => import("./pages/hod/HODHome").then(module => ({ default: module.HODHome })));
const HODFaculty = lazy(() => import("./pages/hod/HODFaculty").then(module => ({ default: module.HODFaculty })));
const HODStudents = lazy(() => import("./pages/hod/HODStudents").then(module => ({ default: module.HODStudents })));
const HODCourses = lazy(() => import("./pages/hod/HODCourses").then(module => ({ default: module.HODCourses })));
const HODProgrammes = lazy(() => import("./pages/hod/HODProgrammes").then(module => ({ default: module.HODProgrammes })));
const HODCourseCOPO = lazy(() => import("./pages/hod/HODCourseCOPO").then(module => ({ default: module.HODCourseCOPO })));
const HODProgrammeAttainment = lazy(() => import("./pages/hod/HODProgrammeAttainment").then(module => ({ default: module.HODProgrammeAttainment })));
const HODStakeholderSurveys = lazy(() => import("./pages/hod/HODStakeholderSurveys").then(module => ({ default: module.HODStakeholderSurveys })));
const HODLogs = lazy(() => import("./pages/hod/HODLogs").then(module => ({ default: module.HODLogs })));

// Lazy-loaded Faculty Pages
const FacultyHome = lazy(() => import("./pages/faculty/FacultyHome").then(module => ({ default: module.FacultyHome })));
const FacultyAssessments = lazy(() => import("./pages/faculty/FacultyAssessments").then(module => ({ default: module.FacultyAssessments })));
const FacultySurvey = lazy(() => import("./pages/faculty/FacultySurvey").then(module => ({ default: module.FacultySurvey })));
const FacultyStudents = lazy(() => import("./pages/faculty/FacultyStudents").then(module => ({ default: module.FacultyStudents })));
const FacultyMarks = lazy(() => import("./pages/faculty/FacultyMarks").then(module => ({ default: module.FacultyMarks })));
const FacultyCOPO = lazy(() => import("./pages/faculty/FacultyCOPO").then(module => ({ default: module.FacultyCOPO })));
const FacultyLogs = lazy(() => import("./pages/faculty/FacultyLogs").then(module => ({ default: module.FacultyLogs })));

// Lazy-loaded Staff Pages
const StaffHome = lazy(() => import("./pages/staff/StaffHome").then(module => ({ default: module.StaffHome })));
const StaffCourses = lazy(() => import("./pages/staff/StaffCourses").then(module => ({ default: module.StaffCourses })));
const StaffEnrollments = lazy(() => import("./pages/staff/StaffEnrollments").then(module => ({ default: module.StaffEnrollments })));

// Lazy-loaded Dean Pages
const DeanHome = lazy(() => import("./pages/dean/DeanHome").then(module => ({ default: module.DeanHome })));
const DeanDepartments = lazy(() => import("./pages/dean/DeanDepartments").then(module => ({ default: module.DeanDepartments })));
const DeanHODManagement = lazy(() => import("./pages/dean/DeanHODManagement").then(module => ({ default: module.DeanHODManagement })));
const DeanUsers = lazy(() => import("./pages/dean/DeanUsers").then(module => ({ default: module.DeanUsers })));
const DeanCourses = lazy(() => import("./pages/dean/DeanCourses").then(module => ({ default: module.DeanCourses })));
const DeanStudents = lazy(() => import("./pages/dean/DeanStudents").then(module => ({ default: module.DeanStudents })));
const DeanAssessments = lazy(() => import("./pages/dean/DeanAssessments").then(module => ({ default: module.DeanAssessments })));
const DeanAnalytics = lazy(() => import("./pages/dean/DeanAnalytics").then(module => ({ default: module.DeanAnalytics })));

function App() {
	return (
		<BrowserRouter>
			<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />

					{/* Protected Routes with Dashboard Layout */}
					<Route element={<DashboardLayout />}>
						{/* Admin Routes */}
						<Route path="/dashboard" element={<AdminHome />} />
						<Route path="/dashboard/users" element={<AdminUsers />} />
						<Route
							path="/dashboard/schools"
							element={<AdminSchools />}
						/>
						<Route
							path="/dashboard/departments"
							element={<AdminDepartments />}
						/>
						<Route
							path="/dashboard/programmes"
							element={<AdminProgrammes />}
						/>
						<Route
							path="/dashboard/students"
							element={<AdminStudents />}
						/>
						<Route
							path="/dashboard/courses"
							element={<AdminCourses />}
						/>
						<Route path="/dashboard/logs" element={<AdminLogs />} />
						<Route path="/hod" element={<HODHome />} />
						<Route path="/hod/faculty" element={<HODFaculty />} />
						<Route path="/hod/students" element={<HODStudents />} />
						<Route path="/hod/programmes" element={<HODProgrammes />} />
						<Route
							path="/hod/programme-attainment"
							element={<HODProgrammeAttainment />}
						/>
						<Route
							path="/hod/stakeholder-surveys"
							element={<HODStakeholderSurveys />}
						/>
						<Route path="/hod/courses" element={<HODCourses />} />
						<Route
							path="/hod/courses/:id/copo"
							element={<HODCourseCOPO />}
						/>
						<Route path="/hod/logs" element={<HODLogs />} />
						{/* Faculty Routes under a unified layout */}
						<Route element={<FacultyLayout />}>
							<Route path="/faculty" element={<FacultyHome />} />
							<Route path="/faculty/logs" element={<FacultyLogs />} />
							<Route
								path="/faculty/assessments"
								element={<FacultyAssessments />}
							/>
							<Route
								path="/faculty/students"
								element={<FacultyStudents />}
							/>
							<Route path="/faculty/marks" element={<FacultyMarks />} />
							<Route path="/faculty/survey" element={<FacultySurvey />} />
							<Route path="/faculty/copo" element={<FacultyCOPO />} />
						</Route>

						{/* Role Routes (Legacy Compatibility for now) */}
						<Route path="/dean" element={<DeanHome />} />
						<Route
							path="/dean/departments"
							element={<DeanDepartments />}
						/>
						<Route
							path="/dean/hod-management"
							element={<DeanHODManagement />}
						/>
						<Route path="/dean/users" element={<DeanUsers />} />
						<Route path="/dean/courses" element={<DeanCourses />} />
						<Route path="/dean/students" element={<DeanStudents />} />
						<Route
							path="/dean/assessments"
							element={<DeanAssessments />}
						/>
						<Route path="/dean/analytics" element={<DeanAnalytics />} />

						{/* Staff Routes */}
						<Route path="/staff" element={<StaffHome />} />
						<Route path="/staff/courses" element={<StaffCourses />} />
						<Route
							path="/staff/enrollments"
							element={<StaffEnrollments />}
						/>
					</Route>

					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
