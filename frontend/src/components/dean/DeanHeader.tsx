import { Menu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import type { DeanPage } from "./DeanSidebar";
import type { User } from "@/services/api";

interface DeanHeaderProps {
	sidebarOpen: boolean;
	currentPage: DeanPage;
	currentUser: User;
	refreshing: boolean;
	onToggleSidebar: () => void;
	onRefresh: () => void;
}

const pageLabels: Record<DeanPage, string> = {
	dashboard: "Dashboard Overview",
	departments: "All Departments",
	users: "All Users",
	courses: "All Courses",
	students: "All Students",
	assessments: "All Assessments",
	analytics: "Department Analytics",
};

export function DeanHeader({
	currentPage,
	refreshing,
	onToggleSidebar,
	onRefresh,
}: DeanHeaderProps) {
	return (
		<header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
			<div className="flex items-center justify-between px-6 py-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleSidebar}
						className="text-gray-600 dark:text-gray-300"
					>
						<Menu className="w-5 h-5" />
					</Button>
					<div>
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							{pageLabels[currentPage]}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Academic Dean Portal - Read Only Access
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={refreshing}
						className="text-gray-600 dark:text-gray-300"
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${
								refreshing ? "animate-spin" : ""
							}`}
						/>
						Refresh
					</Button>
					<AnimatedThemeToggler />
				</div>
			</div>
		</header>
	);
}
