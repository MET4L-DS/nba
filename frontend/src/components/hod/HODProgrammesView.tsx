import { DataTable } from "@/features/shared/DataTable";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { hodApi } from "@/services/api/hod";
import { usePaginatedData } from "@/lib/usePaginatedData";
import type { Programme } from "@/services/api";
import { getProgrammeColumns } from "../admin/ProgrammesView.columns";
import { BulkEnrollStudentsDialog } from "../admin/BulkEnrollStudentsDialog";

export function HODProgrammesView() {
	const {
		data: programmes,
		loading: refreshing,
		refresh: onDataRefresh,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
	} = usePaginatedData<Programme>(({
		fetchFn: (params) => hodApi.getDepartmentProgrammes(params),
		limit: 20,
		defaultSort: "p.programme_code",
	}));

	const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
	const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);

	const openEnrollDialog = (programme: Programme) => {
		setSelectedProgramme(programme);
		setIsEnrollDialogOpen(true);
	};

	const columns = useMemo(
		() =>
			getProgrammeColumns({
				onEnroll: openEnrollDialog,
			}),
		[],
	);

	return (
		<div className="space-y-4">
			<Card className="border-none shadow-none bg-transparent">
				<div className="flex flex-row items-center justify-between p-0 mb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
							<GraduationCap className="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 className="text-xl font-bold">Programmes</h3>
							<p className="text-sm text-muted-foreground">
								Department academic programmes
							</p>
						</div>
					</div>
				</div>
			</Card>

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

			{/* Bulk Enroll Dialog */}
			<BulkEnrollStudentsDialog
				open={isEnrollDialogOpen}
				onOpenChange={setIsEnrollDialogOpen}
				programme={selectedProgramme}
				onSuccess={onDataRefresh}
			/>
		</div>
	);
}
