import { ConfirmDeleteDialog } from "@/features/shared";
import { useMemo, memo } from "react";
import { DataTable } from "@/features/shared/DataTable";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { GraduationCap, RefreshCw, X } from "lucide-react";
import { getFacultyStudentsColumns } from "./FacultyStudents.columns";
import { EditStudentDialog } from "./components/EditStudentDialog";
import { useFacultyStudents } from "./hooks/useFacultyStudents";
import { BATCH_OPTIONS, STATUS_OPTIONS } from "./constants";

interface FacultyStudentsProps {
	hideHeader?: boolean;
}

export const FacultyStudents = memo(function FacultyStudents({
	hideHeader = false,
}: FacultyStudentsProps = {}) {
	const {
		loading,
		statusFilter,
		setStatusFilter,
		batchInput,
		setBatchInput,
		hasFilters,
		editTarget,
		setEditTarget,
		deleteTarget,
		setDeleteTarget,
		deleteLoading,
		filtered,
		loadStudents,
		resetFilters,
		handleDelete,
		handleEditSuccess,
	} = useFacultyStudents();

	const columns = useMemo(
		() => getFacultyStudentsColumns(setEditTarget, setDeleteTarget),
		[setEditTarget, setDeleteTarget],
	);

	return (
		<div className="h-full">
			<div className="px-6 pt-4 pb-8 space-y-6">
				{/* Page header */}
				{!hideHeader && (
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 ring-1 ring-emerald-500/20">
								<GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div>
								<h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
									Enrolled Students
								</h2>
								<p className="text-sm text-muted-foreground">
									Students across all your courses
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={loadStudents}
							disabled={loading}
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				)}

				{/* Table card */}
				<div className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 relative">
					<div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent" />
					<div className="p-6 border-b border-muted/50 flex items-center justify-between">
						<h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
							<GraduationCap className="w-5 h-5 text-indigo-500" />
							All Enrolled Students
						</h3>
						<Button
							variant="outline"
							size="icon"
							onClick={loadStudents}
							disabled={loading}
							className="rounded-xl border-muted/60 bg-background/50 hover:bg-violet-500/5 active:scale-95 duration-200 transition-all"
						>
							<RefreshCw
								className={`h-4 w-4 text-violet-500 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
					<div className="p-6">
						<DataTable
							columns={columns}
							data={filtered || []}
							searchKey="student_name"
							searchPlaceholder="Search by roll no, name or email..."
							refreshing={loading}
						>
							{/* Batch Year */}
							<Select
								value={batchInput || "all"}
								onValueChange={(val) => {
									const actualVal = val === "all" ? "" : val;
									setBatchInput(actualVal);
								}}
							>
								<SelectTrigger className="h-9 w-[130px] rounded-xl border-muted/65 bg-background/50 focus:ring-violet-500/20">
									<SelectValue placeholder="Batch Year" />
								</SelectTrigger>
								<SelectContent className="rounded-xl">
									<SelectItem value="all">
										All Batches
									</SelectItem>
									{BATCH_OPTIONS.map((y) => (
										<SelectItem
											key={y}
											value={y.toString()}
										>
											{y}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Status */}
							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}
							>
								<SelectTrigger className="h-9 w-[140px] rounded-xl border-muted/65 bg-background/50 focus:ring-violet-500/20">
									<SelectValue placeholder="All Status" />
								</SelectTrigger>
								<SelectContent className="rounded-xl">
									<SelectItem value="all">
										All Status
									</SelectItem>
									{STATUS_OPTIONS.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Reset */}
							{hasFilters && (
								<Button
									variant="ghost"
									className="h-9 px-3 shrink-0 rounded-xl hover:bg-rose-500/5 hover:text-rose-600 active:scale-95 duration-200 transition-all font-medium text-xs uppercase tracking-wider"
									onClick={resetFilters}
								>
									Reset
									<X className="ml-1.5 h-3.5 w-3.5 text-rose-500" />
								</Button>
							)}
						</DataTable>
					</div>
				</div>
			</div>

			{/* -- Edit Dialog -- */}
			{editTarget && (
				<EditStudentDialog
					student={editTarget}
					onClose={() => setEditTarget(null)}
					onSuccess={handleEditSuccess}
				/>
			)}

			{/* -- Delete Confirm -- */}
			<ConfirmDeleteDialog
				open={!!deleteTarget}
				onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
				title="Remove Student Enrollment"
				description={
					<>
						This will remove{" "}
						<strong>{deleteTarget?.student_name}</strong> (
						{deleteTarget?.roll_no}) from all of your course
						enrollments. Their marks and data will remain intact.
						This action cannot be undone.
					</>
				}
				confirmText="Remove"
				isLoading={deleteLoading}
				onConfirm={handleDelete}
			/>
		</div>
	);
});
