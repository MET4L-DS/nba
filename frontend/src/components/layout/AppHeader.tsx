import { memo } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface AppHeaderProps {
	sidebarOpen: boolean;
	onToggleSidebar: () => void;
	title: string;
	description?: string;
	onLogout?: () => void;
	children?: React.ReactNode; // For custom actions like Refresh, Course Selector
}

export const AppHeader = memo(function AppHeader({
	sidebarOpen,
	onToggleSidebar,
	title,
	description,
	onLogout,
	children,
}: AppHeaderProps) {
	return (
		<header className="h-14 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between px-4 shrink-0 z-20">
			{/* Left: Sidebar toggle + Title */}
			<div className="flex items-center gap-3 min-w-0">
				<motion.div whileTap={{ scale: 0.88 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleSidebar}
						className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/70 rounded-lg h-8 w-8 shrink-0"
					>
						<motion.div
							animate={{ rotate: sidebarOpen ? 0 : 180 }}
							transition={{ type: "spring", stiffness: 300, damping: 24 }}
						>
							{sidebarOpen ? (
								<PanelLeftClose className="w-4 h-4" />
							) : (
								<PanelLeftOpen className="w-4 h-4" />
							)}
						</motion.div>
					</Button>
				</motion.div>

				{/* Title area */}
				<div className="min-w-0">
					<motion.h1
						className="text-base font-bold text-gray-900 dark:text-white capitalize leading-tight truncate"
						key={title}
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ type: "spring", stiffness: 340, damping: 26 }}
					>
						{title}
					</motion.h1>
					{description && (
						<motion.p
							className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1 }}
						>
							{description}
						</motion.p>
					)}
				</div>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2 shrink-0">
				{children}
				<motion.div whileTap={{ scale: 0.88 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
					<AnimatedThemeToggler />
				</motion.div>
				{onLogout && (
					<motion.div whileTap={{ scale: 0.88 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
						<Button
							variant="ghost"
							size="icon"
							onClick={onLogout}
							className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg h-8 w-8"
							title="Logout"
						>
							<LogOut className="w-4 h-4" />
						</Button>
					</motion.div>
				)}
			</div>
		</header>
	);
});
