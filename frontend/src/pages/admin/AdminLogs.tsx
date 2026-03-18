import { AuditLogsView } from "../../features/audit/AuditLogsView.tsx";

export function AdminLogs() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					System Audit Logs
				</h1>
				<p className="text-muted-foreground">
					View all system activities, creations, modifications, and
					deletions.
				</p>
			</div>
			<AuditLogsView />
		</div>
	);
}
