import { useState, useEffect, useMemo, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/ui/page-loader";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar, type NavItem } from "@/components/layout";
import { apiService } from "@/services/api";
import type { User } from "@/services/api";
import { ProfileSettingsDialog } from "@/features/users";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
	LayoutDashboard,
	ClipboardList,
	FileCheck,
	Network,
	GraduationCap,
	Users,
	BookOpen,
	ShieldCheck,
	Building2,
	UserCog,
	BarChart3,
	History,
	FileText,
} from "lucide-react";

export function DashboardLayout() {
	const [user, setUser] = useState<User | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(() => {
		return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
	});
	const [profileOpen, setProfileOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const storedUser = apiService.getStoredUser();
		const token = apiService.getToken();

		if (!storedUser || !token) {
			navigate("/login", { replace: true });
			return;
		}
		setUser(storedUser);
	}, [navigate]);

	// Handle window resize to dynamically toggle sidebar visibility state
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				setSidebarOpen(true);
			} else {
				setSidebarOpen(false);
			}
		};

		// Initial check on mount
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleLogout = async () => {
		await apiService.logout();
		navigate("/login");
	};

	// Define navigation based on role using useMemo
	const navItems = useMemo((): NavItem[] => {
		if (!user) return [];

		const common = [
			{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
		];

		if (user.is_dean) {
			return [
				...common,
				{ id: "departments", label: "Departments", icon: Building2 },
				{
					id: "hod-management",
					label: "HOD Management",
					icon: UserCog,
				},
				{ id: "users", label: "Users", icon: Users },
				{ id: "courses", label: "Courses", icon: BookOpen },
				{ id: "students", label: "Students", icon: GraduationCap },
				{
					id: "assessments",
					label: "Assessments",
					icon: ClipboardList,
				},
				{ id: "analytics", label: "Analytics", icon: BarChart3 },
				{ id: "logs", label: "Audit Logs", icon: History },
			];
		}

		switch (user.role) {
			case "admin":
				return [
					...common,
					{ id: "users", label: "Users", icon: Users },
					{ id: "courses", label: "Courses", icon: BookOpen },
					{ id: "schools", label: "Schools", icon: ShieldCheck },
					{
						id: "departments",
						label: "Departments",
						icon: Building2,
					},
					{
						id: "programmes",
						label: "Programmes",
						icon: GraduationCap,
					},
					{ id: "logs", label: "Audit Logs", icon: History },
				];
			case "hod":
				return [
					...common,
					{ id: "faculty", label: "Faculty", icon: Users },
					{ id: "students", label: "Students", icon: GraduationCap },
					{
						id: "stakeholder-surveys",
						label: "Surveys",
						icon: FileText,
					},
					{
						id: "programmes",
						label: "Programmes",
						icon: GraduationCap,
					},
					{ id: "courses", label: "Courses", icon: BookOpen },
					{ id: "logs", label: "Audit Logs", icon: History },
				];
			case "faculty":
				return [
					...common,
					{
						id: "assessments",
						label: "Assessments",
						icon: ClipboardList,
					},
					{ id: "students", label: "Students", icon: GraduationCap },
					{ id: "marks", label: "Marks Entry", icon: FileCheck },
					{
						id: "survey",
						label: "Course Survey",
						icon: FileText,
					},
					{ id: "copo", label: "CO-PO Mapping", icon: Network },
					{ id: "logs", label: "Audit Logs", icon: History },
				];
			case "staff":
				return [
					...common,
					{
						id: "programmes",
						label: "Programmes",
						icon: GraduationCap,
					},
					{ id: "courses", label: "Courses", icon: BookOpen },
				];
			default:
				return common;
		}
	}, [user]);

	// Memoize the context object to prevent downstream re-renders on every layout tick
	const contextValue = useMemo(() => ({
		user,
		sidebarOpen,
		setSidebarOpen,
	}), [user, sidebarOpen]);

	if (!user) return null;

	// Determine active ID from URL
	const pathParts = location.pathname.split("/");
	const lastPart = pathParts[pathParts.length - 1];
	
	let activeId = "dashboard";
	const rolePath = user.role === "admin" ? "/dashboard" : (user.is_dean ? "/dean" : `/${user.role}`);
	if (location.pathname !== rolePath && location.pathname !== `${rolePath}/` && lastPart) {
		activeId = lastPart;
	}

	const onNavigate = (id: string) => {
		let rolePath = `/${user.role}`;
		if (user.role === "admin") {
			rolePath = "/dashboard";
		} else if (user.is_dean) {
			rolePath = "/dean";
		}

		if (id === "dashboard") {
			navigate(rolePath);
		} else {
			navigate(`${rolePath}/${id}`);
		}

		// Close sidebar drawer if navigating on mobile
		if (window.innerWidth < 768) {
			setSidebarOpen(false);
		}
	};

	return (
		<div className="flex h-screen bg-background w-full overflow-hidden">
			<Toaster />
			
			{/* Desktop Sidebar */}
			<AppSidebar
				items={navItems}
				user={user}
				activeId={activeId}
				onNavigate={onNavigate}
				onLogout={handleLogout}
				onProfileClick={() => setProfileOpen(true)}
				sidebarOpen={sidebarOpen}
				className="hidden md:flex"
			/>

			{/* Mobile Sidebar (Drawer) */}
			<Sheet open={sidebarOpen && window.innerWidth < 768} onOpenChange={setSidebarOpen}>
				<SheetContent side="left" className="p-0 w-64 border-r-0" showCloseButton={false}>
					<SheetTitle className="sr-only">Navigation Sidebar</SheetTitle>
					<AppSidebar
						items={navItems}
						user={user}
						activeId={activeId}
						onNavigate={onNavigate}
						onLogout={handleLogout}
						onProfileClick={() => setProfileOpen(true)}
						sidebarOpen={true}
						className="w-full h-full border-r-0"
					/>
				</SheetContent>
			</Sheet>

			<main className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<Suspense fallback={<PageLoader />}>
					<Outlet context={contextValue} />
				</Suspense>
			</main>

			<ProfileSettingsDialog 
				open={profileOpen} 
				onOpenChange={setProfileOpen} 
				onProfileUpdate={(updatedUser) => setUser(updatedUser)} 
			/>
		</div>
	);
}
