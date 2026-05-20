import { useMemo } from "react";
import { usePaginatedData } from "@/lib/usePaginatedData";
import type {
	Programme,
	PaginationParams,
	PaginatedResponse,
} from "@/services/api";
import { DataTable } from "@/features/shared/DataTable";
import { getProgrammeColumns } from "@/components/admin/ProgrammesView.columns";

interface ProgrammeListProps {
	fetchFn: (
		params: PaginationParams,
	) => Promise<PaginatedResponse<Programme>>;
	title: string;
	onEdit: (programme: Programme) => void;
	onDelete: (programme: Programme) => void;
	onViewAttainment?: (programme: Programme) => void;
}

export function ProgrammeList({
	fetchFn,
	title,
	onEdit,
	onDelete,
	onViewAttainment,
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
	} = usePaginatedData<Programme>({
		fetchFn,
		limit: 20,
		defaultSort: "p.programme_code",
	});

	const columns = useMemo(
		() => getProgrammeColumns({ onEdit, onDelete, onViewAttainment }),
		[onEdit, onDelete, onViewAttainment],
	);

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">{title}</h3>
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
				}}
			/>
		</div>
	);
}
