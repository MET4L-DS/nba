import { useMemo } from "react";
import { usePaginatedData } from "@/lib/usePaginatedData";
import type {
	Programme,
	PaginationParams,
	PaginatedResponse,
} from "@/services/api";
import { DataTable } from "@/features/shared/DataTable";
import { getProgrammeColumns } from "@/components/admin/ProgrammesView.columns";
import { motion } from "framer-motion";

interface ProgrammeListProps {
	fetchFn: (
		params: PaginationParams,
	) => Promise<PaginatedResponse<Programme>>;
	title: string;
	onEdit: (programme: Programme) => void;
	onDelete: (programme: Programme) => void;
	onViewAttainment?: (programme: Programme) => void;
	onEnroll?: (programme: Programme) => void;
	onManageCourses?: (programme: Programme) => void;
}

export function ProgrammeList({
	fetchFn,
	title,
	onEdit,
	onDelete,
	onViewAttainment,
	onEnroll,
	onManageCourses,
}: ProgrammeListProps) {
	const {
		data: programmes,
		loading: refreshing,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		sort,
		sortDir,
		setSort,
		setLimit,
	} = usePaginatedData<Programme>({
		fetchFn,
		limit: 20,
		defaultSort: "p.programme_code",
	});

	const columns = useMemo(
		() => getProgrammeColumns({ onEdit, onDelete, onViewAttainment, onEnroll, onManageCourses }),
		[onEdit, onDelete, onViewAttainment, onEnroll, onManageCourses],
	);

	return (
		<motion.div 
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
			className="space-y-4"
		>
			<motion.h3 
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.1, type: "spring" }}
				className="text-lg font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent"
			>
				{title}
			</motion.h3>
			<motion.div
				initial={{ opacity: 0, scale: 0.99, y: 5 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ delay: 0.18, type: "spring", duration: 0.4 }}
			>
				<DataTable
					columns={columns}
					data={programmes || []}
					searchPlaceholder="Search programmes..."
					refreshing={refreshing}
					serverPagination={{
						pagination,
						onNext: goNext,
						onPrev: goPrev,
						canPrev,
						pageIndex,
						search,
						onSearch: setSearch,
						onLimitChange: setLimit,
						sort,
						sortDir,
						setSort,
					}}
				/>
			</motion.div>
		</motion.div>
	);
}
