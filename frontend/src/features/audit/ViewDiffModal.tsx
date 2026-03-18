import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../../components/ui/dialog";
import { type AuditLog } from "../../services/api/audit";
import { format } from "date-fns";
import { Badge } from "../../components/ui/badge";

interface ViewDiffModalProps {
	log: AuditLog;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ViewDiffModal({ log, open, onOpenChange }: ViewDiffModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Audit Details{" "}
						<Badge variant="outline">{log.action}</Badge>
					</DialogTitle>
					<DialogDescription>
						{format(new Date(log.created_at), "PP pp")} —{" "}
						{log.entity_type} ID: {log.entity_id}
						<br />
						Actor: {log.username || "System"} (
						{log.user_id || "N/A"}) • IP:{" "}
						{log.ip_address || "Unknown"}
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-4 mt-4">
					<div className="border rounded-md p-4 bg-muted/20">
						<h4 className="font-semibold mb-2 text-sm text-muted-foreground">
							Previous State
						</h4>
						<pre className="text-xs overflow-auto whitespace-pre-wrap">
							{log.old_values
								? JSON.stringify(log.old_values, null, 2)
								: "None"}
						</pre>
					</div>
					<div className="border rounded-md p-4 bg-muted/20">
						<h4 className="font-semibold mb-2 text-sm text-muted-foreground">
							New State
						</h4>
						<pre className="text-xs overflow-auto whitespace-pre-wrap">
							{log.new_values
								? JSON.stringify(log.new_values, null, 2)
								: "None"}
						</pre>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
