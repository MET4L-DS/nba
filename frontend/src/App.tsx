import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import { PageLoader } from "./components/ui/page-loader";

const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout").then(module => ({ default: module.DashboardLayout })));
const FacultyLayout = lazy(() => import("./components/layout/FacultyLayout").then(module => ({ default: module.FacultyLayout })));

const LoginPage = lazy(() => import("./pages/LoginPage").then(module => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(module => ({ default: module.ResetPasswordPage })));

// Lazy-loaded Admin Pages
const AdminHome = lazy(() => import("./pages/admin/AdminHome").then(module => ({ default: module.AdminHome })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(module => ({ default: module.AdminUsers })));
const AdminSchools = lazy(() => import("./pages/admin/AdminSchools").then(module => ({ default: module.AdminSchools })));
const AdminDepartments = lazy(() => import("./pages/admin/AdminDepartments").then(module => ({ default: module.AdminDepartments })));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents").then(module => ({ default: module.AdminStudents })));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses").then(module => ({ default: module.AdminCourses })));
const AdminProgrammes = lazy(() => import("./pages/admin/AdminProgrammes").then(module => ({ default: module.AdminProgrammes })));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs").then(module => ({ default: module.AdminLogs })));
const SystemSettingsPage = lazy(() => import("./pages/admin/SystemSettingsPage").then(module => ({ default: module.SystemSettingsPage })));

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
const StaffProgrammes = lazy(() => import("./pages/staff/StaffProgrammes").then(module => ({ default: module.StaffProgrammes })));
const StaffEnrolledStudents = lazy(() => import("./pages/staff/StaffEnrolledStudents").then(module => ({ default: module.StaffEnrolledStudents })));

// Lazy-loaded Dean Pages
const DeanHome = lazy(() => import("./pages/dean/DeanHome").then(module => ({ default: module.DeanHome })));
const DeanDepartments = lazy(() => import("./pages/dean/DeanDepartments").then(module => ({ default: module.DeanDepartments })));
const DeanHODManagement = lazy(() => import("./pages/dean/DeanHODManagement").then(module => ({ default: module.DeanHODManagement })));
const DeanUsers = lazy(() => import("./pages/dean/DeanUsers").then(module => ({ default: module.DeanUsers })));
const DeanCourses = lazy(() => import("./pages/dean/DeanCourses").then(module => ({ default: module.DeanCourses })));
const DeanStudents = lazy(() => import("./pages/dean/DeanStudents").then(module => ({ default: module.DeanStudents })));
const DeanAssessments = lazy(() => import("./pages/dean/DeanAssessments").then(module => ({ default: module.DeanAssessments })));
const DeanAnalytics = lazy(() => import("./pages/dean/DeanAnalytics").then(module => ({ default: module.DeanAnalytics })));
const DeanAuditLogs = lazy(() => import("./pages/dean/DeanAuditLogs").then(module => ({ default: module.DeanAuditLogs })));

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/reset-password" element={<ResetPasswordPage />} />

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
						<Route path="/dashboard/settings" element={<SystemSettingsPage />} />
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
						<Route path="/dean/logs" element={<DeanAuditLogs />} />

						{/* Staff Routes */}
						<Route path="/staff" element={<StaffHome />} />
						<Route path="/staff/courses" element={<StaffCourses />} />
						<Route
							path="/staff/programmes"
							element={<StaffProgrammes />}
						/>
						<Route
							path="/staff/enrolled-students"
							element={<StaffEnrolledStudents />}
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
