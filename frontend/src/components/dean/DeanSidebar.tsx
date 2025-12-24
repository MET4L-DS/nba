import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	LayoutDashboard,
	Building2,
	Users,
	BookOpen,
	GraduationCap,
	ClipboardList,
	BarChart3,
	LogOut,
	Settings,
} from "lucide-react";
import type { User } from "@/services/api";

export type DeanPage =
	| "dashboard"
	| "departments"
	| "users"
	| "courses"
	| "students"
	| "assessments"
	| "analytics";

interface DeanSidebarProps {
	currentUser: User;
	sidebarOpen: boolean;
	currentPage: DeanPage;
	onPageChange: (page: DeanPage) => void;
	onLogout: () => void;
}

export function DeanSidebar({
	currentUser,
	sidebarOpen,
	currentPage,
	onPageChange,
	onLogout,
}: DeanSidebarProps) {
	const navItems = [
		{
			id: "dashboard" as DeanPage,
			label: "Dashboard",
			icon: LayoutDashboard,
		},
		{
			id: "departments" as DeanPage,
			label: "Departments",
			icon: Building2,
		},
		{ id: "users" as DeanPage, label: "Users", icon: Users },
		{ id: "courses" as DeanPage, label: "Courses", icon: BookOpen },
		{ id: "students" as DeanPage, label: "Students", icon: GraduationCap },
		{
			id: "assessments" as DeanPage,
			label: "Assessments",
			icon: ClipboardList,
		},
		{
			id: "analytics" as DeanPage,
			label: "Analytics",
			icon: BarChart3,
		},
	];

	return (
		<aside
			className={`${
				sidebarOpen ? "w-64" : "w-0"
			} transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden`}
		>
			<div className="flex flex-col h-full">
				{/* University Info */}
				<div className="p-6 border-b border-gray-200 dark:border-gray-800">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
							TU
						</div>
						<div className="flex-1 min-w-0">
							<h2 className="text-sm font-bold text-gray-900 dark:text-white">
								Tezpur University
							</h2>
							<p className="text-xs text-gray-600 dark:text-gray-400 truncate">
								Academic Dean
							</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<ScrollArea className="flex-1 px-3 py-4">
					<nav className="space-y-1">
						{navItems.map((item) => (
							<button
								key={item.id}
								onClick={() => onPageChange(item.id)}
								className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
									currentPage === item.id
										? "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
								}`}
							>
								<item.icon className="w-5 h-5" />
								<span>{item.label}</span>
							</button>
						))}
					</nav>

					<Separator className="my-4" />

					{/* Settings */}
					<nav className="space-y-1">
						<button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
							<Settings className="w-5 h-5" />
							<span>Settings</span>
						</button>
					</nav>
				</ScrollArea>

				{/* User Profile & Logout */}
				<div className="p-4 border-t border-gray-200 dark:border-gray-800">
					<div className="flex items-center gap-3 mb-3">
						<Avatar className="w-10 h-10">
							<AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm font-medium">
								{currentUser.username
									.split(" ")
									.map((n) => n[0])
									.join("")
									.substring(0, 2)
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
								{currentUser.username}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
								{currentUser.email}
							</p>
						</div>
					</div>
					<button
						onClick={onLogout}
						className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
					>
						<LogOut className="w-4 h-4" />
						<span>Sign Out</span>
					</button>
				</div>
			</div>
		</aside>
	);
}
