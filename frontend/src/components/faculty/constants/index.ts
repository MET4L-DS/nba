import {
	BookOpen,
	ClipboardList,
	GraduationCap,
	TrendingUp,
	FileCheck,
	Network,
	type LucideIcon,
} from "lucide-react";

export const ITEMS_PER_PAGE = 10;

export const STATUS_OPTIONS = ["Active", "Inactive", "Graduated", "Dropped"];

export const BATCH_OPTIONS = Array.from(
	{ length: 10 },
	(_, i) => new Date().getFullYear() - 4 + i,
);

export const TEST_TYPE_COLORS: Record<string, string> = {
	"Mid Sem":
		"bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-200 dark:border-violet-800",
	"End Sem":
		"bg-rose-50   text-rose-700   dark:bg-rose-950   dark:text-rose-300   border-rose-200   dark:border-rose-800",
	Assignment:
		"bg-amber-50  text-amber-700  dark:bg-amber-950  dark:text-amber-300  border-amber-200  dark:border-amber-800",
	Quiz: "bg-sky-50    text-sky-700    dark:bg-sky-950    dark:text-sky-300    border-sky-200    dark:border-sky-800",
};

export interface QuickAccessItemTemplate {
	id: string;
	title: string;
	description: string;
	icon: LucideIcon;
	gradient: string;
}

export const QUICK_ACCESS_ITEMS: QuickAccessItemTemplate[] = [
	{
		id: "assessments",
		title: "Manage Assessments",
		description: "Create and manage course assessments",
		icon: ClipboardList,
		gradient: "from-blue-500 to-indigo-600",
	},
	{
		id: "marks",
		title: "Enter Marks",
		description: "Record student assessment scores",
		icon: FileCheck,
		gradient: "from-purple-500 to-pink-600",
	},
	{
		id: "copo",
		title: "CO-PO Analysis",
		description: "View course outcome attainment",
		icon: Network,
		gradient: "from-emerald-500 to-teal-600",
	},
];

export interface StatItemTemplate {
	label: string;
	key: "totalCourses" | "totalAssessments" | "totalStudents" | "averageAttainment";
	icon: LucideIcon;
	gradient: string;
	bgGradient: string;
	suffix?: string;
}

export const STAT_ITEMS_TEMPLATES: StatItemTemplate[] = [
	{
		label: "My Courses",
		key: "totalCourses",
		icon: BookOpen,
		gradient: "from-blue-500 to-indigo-600",
		bgGradient:
			"from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
	},
	{
		label: "Assessments Created",
		key: "totalAssessments",
		icon: ClipboardList,
		gradient: "from-purple-500 to-pink-600",
		bgGradient:
			"from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
	},
	{
		label: "Total Students",
		key: "totalStudents",
		icon: GraduationCap,
		gradient: "from-emerald-500 to-teal-600",
		bgGradient:
			"from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-emerald-950/30",
	},
	{
		label: "Avg. Attainment",
		key: "averageAttainment",
		suffix: "%",
		icon: TrendingUp,
		gradient: "from-orange-500 to-red-600",
		bgGradient:
			"from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-orange-950/30",
	},
];
