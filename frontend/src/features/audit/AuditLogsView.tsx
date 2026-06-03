import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { type AuditLog } from "../../services/api/audit";
import { DataTable } from "../../features/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { sortableHeader } from "../../features/shared/tableUtils";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { ViewDiffModal } from "./ViewDiffModal";
import { RefreshCw, Eye, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

const ACTION_FILTERS = ["ALL", "CREATE", "UPDATE", "DELETE"] as const;

export interface AuditLogsViewProps {
	fetchFn: (params: { page?: number; limit?: number; sort?: string; sort_dir?: string }) => Promise<any>;
}

export function AuditLogsView({ fetchFn }: AuditLogsViewProps) {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [limit, setLimit] = useState(15);
	const totalPages = Math.ceil(totalItems / limit) || 1;
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [actionFilter, setActionFilter] =
		useState<(typeof ACTION_FILTERS)[number]>("ALL");
	const [sort, setSort] = useState("created_at");
	const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");

	const fetchLogs = useCallback(async (p = page, l = limit, s = sort, sd = sortDir) => {
		setIsLoading(true);
		try {
			const res: any = await fetchFn({ page: p, limit: l, sort: s, sort_dir: sd });
			if (res.success) {
				setLogs(res.data);
				if (res.pagination) {
					const total = res.pagination.total ?? res.pagination.total_records ?? res.pagination.total_items ?? 0;
					setTotalItems(total);
				}
			}
		} catch (error) {
			console.error("Failed to fetch logs", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchFn, page, limit, sort, sortDir]);

	useEffect(() => {
		fetchLogs(page, limit, sort, sortDir);
	}, [page, limit, sort, sortDir, fetchLogs]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setPage(1);
	};

	const filteredLogs = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();

		return logs.filter((log) => {
			const matchesAction =
				actionFilter === "ALL" || log.action === actionFilter;
			const matchesSearch =
				!query ||
				(log.entity_type || "").toLowerCase().includes(query) ||
				(log.entity_id || "").toLowerCase().includes(query) ||
				(log.username || "").toLowerCase().includes(query) ||
				(log.action || "").toLowerCase().includes(query);

			return matchesAction && matchesSearch;
		});
	}, [logs, searchTerm, actionFilter]);

	const columns: ColumnDef<AuditLog>[] = useMemo(
		() => [
			{
				accessorKey: "created_at",
				header: sortableHeader("Timestamp"),
				cell: ({ row }: any) => {
					return (
						<span>
							{format(new Date(row.original.created_at), "PP p")}
						</span>
					);
				},
			},
			{
				accessorKey: "action",
				header: sortableHeader("Action"),
				cell: ({ row }: any) => {
					const action = row.original.action;
					if (action === "CREATE") {
						return (
							<Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold shadow-sm">
								CREATE
							</Badge>
						);
					}
					if (action === "UPDATE") {
						return (
							<Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-semibold shadow-sm">
								UPDATE
							</Badge>
						);
					}
					if (action === "DELETE") {
						return (
							<Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold shadow-sm">
								DELETE
							</Badge>
						);
					}
					return (
						<Badge variant="outline" className="bg-muted text-muted-foreground border-muted/50 shadow-sm">
							{action}
						</Badge>
					);
				},
			},
			{
				accessorKey: "entity_type",
				header: sortableHeader("Entity"),
			},
			{
				accessorKey: "username",
				header: sortableHeader("Actor", "text-left"),
				cell: ({ row }: any) => {
					if (row.original.username) {
						return (
							<span className="text-left block">
								{row.original.username} ({row.original.user_id})
							</span>
						);
					}
					return (
						<span className="text-muted-foreground text-left block">System</span>
					);
				},
			},
			{
				id: "actions",
				header: "Details",
				cell: ({ row }: any) => (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelectedLog(row.original)}
						className="h-8 gap-2 text-primary hover:bg-primary/[0.06] hover:text-primary font-semibold active:scale-95 duration-200 transition-all"
					>
						<Eye className="h-4 w-4 text-primary" />
						View
					</Button>
				),
			},
		],
		[],
	);

	return (
		<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
			<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/80 via-indigo-500 to-transparent"></div>
			<CardHeader className="space-y-4 pb-4 border-b bg-muted/[.06] pt-6">
				<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner text-primary">
							<Activity className="h-5 w-5" />
						</div>
						<div>
							<CardTitle className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text flex items-center gap-2">
								System Audit Trail
							</CardTitle>
							<p className="text-xs text-muted-foreground mt-0.5">
								High-density event stream for user and system changes.
							</p>
						</div>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchLogs(page, limit, sort, sortDir)}
						disabled={isLoading}
						className="h-9 text-xs font-semibold hover:bg-primary/[0.04] hover:text-primary transition-all duration-200 active:scale-95"
					>
						<RefreshCw
							className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Tabs
						value={actionFilter}
						onValueChange={(v) => setActionFilter(v as "ALL" | "CREATE" | "UPDATE" | "DELETE")}
						layoutId="audit-logs-action-tabs"
					>
						<TabsList className="bg-muted/50 p-1 rounded-lg flex flex-wrap gap-1 border border-muted/40 backdrop-blur-sm h-auto">
							{ACTION_FILTERS.map((action) => (
								<TabsTrigger
									key={action}
									value={action}
									className="px-3 py-1 h-8 text-xs font-semibold rounded-md transition-all duration-200 hover:text-foreground active:scale-95 duration-200 transition-all data-[state=active]:bg-card"
								>
									{action}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
					<Badge variant="outline" className="ml-auto bg-primary/5 text-primary border-primary/10 font-semibold py-1">
						Showing {filteredLogs.length} of {logs.length} on this page
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="pt-6">
				<DataTable
					columns={columns}
					data={filteredLogs}
					refreshing={isLoading}
					searchPlaceholder="Search actor, entity, or action..."
					serverPagination={{
						pagination: {
							total: totalItems,
							limit: limit,
							next_cursor: page < totalPages ? "next" : null,
							prev_cursor: page > 1 ? "prev" : null,
							has_more: page < totalPages,
						},
						onNext: () => handlePageChange(page + 1),
						onPrev: () => handlePageChange(page - 1),
						canPrev: page > 1,
						pageIndex: page - 1,
						search: searchTerm,
						onSearch: setSearchTerm,
						onLimitChange: handleLimitChange,
						sort,
						sortDir,
						setSort: (field: string, dir?: "ASC" | "DESC") => {
							setSort(field);
							if (dir) setSortDir(dir);
							setPage(1);
						},
					}}
				/>

				{selectedLog && (
					<ViewDiffModal
						log={selectedLog}
						open={!!selectedLog}
						onOpenChange={(op) => !op && setSelectedLog(null)}
					/>
				)}
			</CardContent>
		</Card>
	);
}
