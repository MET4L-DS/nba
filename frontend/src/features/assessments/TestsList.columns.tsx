import { memo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getBaseTestColumns } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import type { Test } from "@/services/api";

interface TestsListActionsCellProps {
	test: Test;
	onView: (id: number) => void;
	onDelete: (test: Test) => void;
}

export const TestsListActionsCell = memo(function TestsListActionsCell({
	test,
	onView,
	onDelete,
}: TestsListActionsCellProps) {
	return (
		<div className="flex justify-end gap-1">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onView(test.id)}
				className="gap-1.5 h-8"
			>
				<Eye className="w-3.5 h-3.5" />
				View
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onDelete(test)}
				className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
			>
				<Trash2 className="w-3.5 h-3.5" />
				Delete
			</Button>
		</div>
	);
});

export function getTestsListColumns(
	onView: (id: number) => void,
	onDelete: (test: Test) => void
): ColumnDef<Test>[] {
	return [
		...getBaseTestColumns<Test>(),
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<TestsListActionsCell
					test={row.original}
					onView={onView}
					onDelete={onDelete}
				/>
			),
		},
	];
}
