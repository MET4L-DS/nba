import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import type { User } from "@/services/api";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";

export interface NavItem {
	id: string;
	label: string;
	icon: React.ElementType;
}

interface AppSidebarProps {
	user: User;
	sidebarOpen: boolean;
	items: NavItem[];
	bottomItems?: NavItem[];
	activeId: string;
	onNavigate: (id: string) => void;
	onLogout: () => void;
	onProfileClick?: () => void;
	title?: string;
	subtitle?: string;
	className?: string;
}

export function AppSidebar({
	user,
	sidebarOpen,
	items,
	bottomItems,
	activeId,
	onNavigate,
	onLogout,
	onProfileClick,
	title = "Tezpur University",
	subtitle,
	className,
}: AppSidebarProps) {
	const { settings } = useSettings();
	const displayTitle =
		title === "Tezpur University" && settings
			? settings.university_name
			: title;

	const renderNavItem = (item: NavItem) => {
		const Icon = item.icon;
		const isActive = activeId === item.id;
		return (
			<div key={item.id} className="relative">
				{/* Sliding capsule background */}
				{isActive && (
					<motion.div
						layoutId="activeNavIndicator"
						className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40"
						transition={{
							type: "spring",
							stiffness: 380,
							damping: 30,
						}}
					/>
				)}
				<motion.button
					onClick={() => onNavigate(item.id)}
					className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
						isActive
							? "text-indigo-700 dark:text-indigo-300"
							: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/60"
					}`}
					whileTap={{ scale: 0.97 }}
					transition={{ type: "spring", stiffness: 440, damping: 28 }}
				>
					<motion.div
						animate={isActive ? { scale: 1.12 } : { scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 340,
							damping: 22,
						}}
					>
						<Icon
							className={`w-4.5 h-4.5 shrink-0 ${
								isActive
									? "text-indigo-600 dark:text-indigo-400"
									: "text-gray-500 dark:text-gray-500"
							}`}
						/>
					</motion.div>
					<span className="font-semibold text-[13px] truncate">
						{item.label}
					</span>
					{isActive && (
						<motion.div
							className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 18,
							}}
						/>
					)}
				</motion.button>
			</div>
		);
	};

	return (
		<motion.aside
			animate={{ width: sidebarOpen ? 256 : 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={cn(
				"bg-white dark:bg-gray-950 border-r border-gray-200/80 dark:border-gray-800/80 overflow-hidden shrink-0 flex flex-col h-full",
				className,
			)}
			style={{ minWidth: 0, willChange: "width" }}
		>
			<div className="flex flex-col h-full w-64">
				{/* Header / Logo */}
				<div className="p-5 border-b border-gray-200/80 dark:border-gray-800/80 shrink-0">
					<div className="flex items-center gap-3">
						<motion.div
							className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
							whileHover={{ scale: 1.06, rotate: 3 }}
							transition={{
								type: "spring",
								stiffness: 340,
								damping: 22,
							}}
						>
							<img
								src={settings?.logo_url || "/tulogo.png"}
								alt="Logo"
								className="w-8 h-8 object-contain"
							/>
						</motion.div>
						<div className="flex-1 min-w-0">
							<h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
								{displayTitle}
							</h2>
							<p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">
								{subtitle || user.department_name || user.role}
							</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<ScrollArea className="flex-1 px-3 py-3">
					<nav className="space-y-0.5 relative">
						{items.map(renderNavItem)}
					</nav>

					{/* Bottom Navigation */}
					{bottomItems && bottomItems.length > 0 && (
						<>
							<div className="my-3 border-t border-gray-200/70 dark:border-gray-800/70" />
							<nav className="space-y-0.5 relative">
								{bottomItems.map(renderNavItem)}
							</nav>
						</>
					)}

					{/* Divider */}
					<div className="my-3 border-t border-gray-200/70 dark:border-gray-800/70" />

					{/* Logout */}
					<div>
						<motion.button
							onClick={onLogout}
							className="w-full mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 transition-colors"
							whileTap={{ scale: 0.97 }}
						>
							<LogOut className="w-4 h-4 shrink-0" />
							<span className="text-[13px]">Logout</span>
						</motion.button>
					</div>
				</ScrollArea>

				{/* User Profile */}
				<div className="p-4 border-t border-gray-200/80 dark:border-gray-800/80 shrink-0">
					<button
						onClick={onProfileClick}
						className="w-full flex items-center gap-3 text-left p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors cursor-pointer group"
					>
						<Avatar className="h-9 w-9 ring-2 ring-indigo-100 dark:ring-indigo-900/50 group-hover:scale-105 transition-transform">
							<AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
								{user.username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
								{user.username}
							</p>
							<p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
								{user.email}
							</p>
						</div>
						<motion.div
							className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0"
							animate={{ scale: [1, 1.25, 1] }}
							transition={{
								duration: 2.5,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
					</button>
				</div>
			</div>
		</motion.aside>
	);
}
