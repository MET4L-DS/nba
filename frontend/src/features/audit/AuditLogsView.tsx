import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { type AuditLog, auditApi } from "../../services/api/audit";
import { DataTable } from "../../features/shared/DataTable";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { ViewDiffModal } from "./ViewDiffModal";
import { RefreshCw, Eye } from "lucide-react";

export function AuditLogsView() {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

	const fetchLogs = async (p = page) => {
		setIsLoading(true);
		try {
			const res: any = await auditApi.getLogs({ page: p, limit: 15 });
			if (res.success) {
				setLogs(res.data);
				if (res.pagination) {
					setTotalPages(res.pagination.total_pages);
				}
			}
		} catch (error) {
			console.error("Failed to fetch logs", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs(1);
	}, []);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		fetchLogs(newPage);
	};

	const columns = useMemo(
		() => [
			{
				accessorKey: "created_at",
				header: "Timestamp",
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
				header: "Action",
				cell: ({ row }: any) => {
					const action = row.original.action;
					const variants: any = {
						CREATE: "default",
						UPDATE: "secondary",
						DELETE: "destructive",
					};
					return (
						<Badge variant={variants[action] || "outline"}>
							{action}
						</Badge>
					);
				},
			},
			{
				accessorKey: "entity_type",
				header: "Entity",
			},
			{
				accessorKey: "entity_id",
				header: "Entity ID",
			},
			{
				accessorKey: "username",
				header: "Actor",
				cell: ({ row }: any) => {
					if (row.original.username) {
						return (
							<span>
								{row.original.username} ({row.original.user_id})
							</span>
						);
					}
					return (
						<span className="text-muted-foreground">System</span>
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
					>
						<Eye className="h-4 w-4 mr-2" />
						View
					</Button>
				),
			},
		],
		[],
	);

	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex justify-between mb-4">
					<h2 className="text-xl font-semibold">Audit Trial</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchLogs()}
						disabled={isLoading}
					>
						<RefreshCw className="mr-2 h-4 w-4" /> Refresh
					</Button>
				</div>

				<DataTable
					columns={columns}
					data={logs}
					refreshing={isLoading}
					serverPagination={{
						pagination: {
							total: totalPages * 15,
							limit: 15,
							next_cursor: page < totalPages ? "next" : null,
							prev_cursor: page > 1 ? "prev" : null,
							has_more: page < totalPages,
						},
						onNext: () => handlePageChange(page + 1),
						onPrev: () => handlePageChange(page - 1),
						canPrev: page > 1,
						pageIndex: page,
						search: "",
						onSearch: () => {},
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
