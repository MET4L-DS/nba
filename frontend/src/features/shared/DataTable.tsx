import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ExpandedState,
	type Row,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type Table as TableType,
} from "@tanstack/react-table";
import {
	ChevronDown,
	RefreshCw,
	X,
	Search,
	Loader2,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PaginationMeta } from "@/services/api/types";
import { Skeleton } from "@/components/ui/skeleton";

export interface ServerPaginationProps<F extends Record<string, any> = any> {
	pagination: PaginationMeta | null;
	onNext: () => void;
	onPrev: () => void;
	canPrev: boolean;
	pageIndex: number;
	search: string;
	onSearch: (value: string) => void;
	filters?: Partial<F>;
	setFilter?: (key: keyof F, value: any) => void;
	sort?: string;
	sortDir?: "ASC" | "DESC";
	setSort?: (field: string, dir?: "ASC" | "DESC") => void;
}

interface DataTableProps<TData, TValue, F extends Record<string, any> = any> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	refreshing?: boolean;
	children?:
		| React.ReactNode
		| ((
				table: TableType<TData>,
				filters?: Partial<F>,
				setFilter?: (key: keyof F, value: any) => void,
		  ) => React.ReactNode);
	serverPagination?: ServerPaginationProps<F>;
	renderSubRow?: (row: Row<TData>) => React.ReactNode;
}

const MotionTableRow = motion(TableRow);

// ── 1. TABLE TOOLBAR (MEMOIZED) ──────────────────────────────────────────────
interface TableToolbarProps<TData, F extends Record<string, any> = any> {
	table: TableType<TData>;
	refreshing: boolean;
	searchKey?: string;
	searchPlaceholder?: string;
	serverPagination?: any;
	isServerMode: boolean;
	children?:
		| React.ReactNode
		| ((
				table: TableType<TData>,
				filters?: Partial<F>,
				setFilter?: (key: keyof F, value: any) => void,
		  ) => React.ReactNode);
}

function TableToolbar<TData, F extends Record<string, any> = any>({
	table,
	refreshing,
	searchKey,
	searchPlaceholder = "Search...",
	serverPagination,
	isServerMode,
	children,
}: TableToolbarProps<TData, F>) {
	const sp = serverPagination;
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				{/* Server-side search input */}
				{isServerMode && (
					<div className="relative">
						{refreshing ? (
							<Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
						) : (
							<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						)}
						<Input
							placeholder={searchPlaceholder}
							value={sp!.search}
							onChange={(e) => sp!.onSearch(e.target.value)}
							className="pl-9 h-9 w-[150px] lg:w-[250px] bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>
				)}
				{/* Client-side search input */}
				{!isServerMode && searchKey && (
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
							onChange={(event) =>
								table.getColumn(searchKey)?.setFilterValue(event.target.value)
							}
							className="pl-9 h-9 w-[150px] lg:w-[250px] bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
						/>
					</div>
				)}
				{typeof children === "function"
					? (children as any)(table, sp?.filters, sp?.setFilter)
					: children}
				{!isServerMode && isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-9 px-3 shrink-0 rounded-xl active:scale-95 duration-200 transition-all hover:bg-muted/50 text-muted-foreground hover:text-foreground"
					>
						Reset
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="ml-auto shrink-0 bg-background/60 border-muted/50 rounded-xl active:scale-95 duration-200 transition-all shadow-sm">
						{refreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
						Columns <ChevronDown className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
					{table
						.getAllColumns()
						.filter((column) => column.getCanHide())
						.map((column) => (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize rounded-lg focus:bg-muted/60"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

// ── 2. TABLE CONTENT (MEMOIZED ROWS) ─────────────────────────────────────────
interface TableContentProps<TData> {
	table: TableType<TData>;
	columns: ColumnDef<TData, any>[];
	refreshing: boolean;
	renderSubRow?: (row: Row<TData>) => React.ReactNode;
}

function TableContent<TData>({
	table,
	columns,
	refreshing,
	renderSubRow,
}: TableContentProps<TData>) {
	return (
		<div className="rounded-2xl border border-muted/50 bg-card/45 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 relative group">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className="text-center">
									<div className="flex justify-center">
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</div>
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{refreshing ? (
						<>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									{columns.map((_, j) => (
										<TableCell key={j}>
											<Skeleton className="h-6 w-full" />
										</TableCell>
									))}
								</TableRow>
							))}
						</>
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row, idx) => (
							<React.Fragment key={row.id}>
								<MotionTableRow
									data-state={row.getIsSelected() && "selected"}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										ease: [0.16, 1, 0.3, 1],
										duration: 0.4,
										delay: Math.min(idx * 0.02, 0.2),
									}}
									style={{ willChange: "transform, opacity" }}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="text-center font-medium">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</MotionTableRow>
								<AnimatePresence initial={false}>
									{row.getIsExpanded() && renderSubRow && (
										<motion.tr
											key={`sub-${row.id}`}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.2, ease: "easeInOut" }}
											data-slot="table-row"
											className="bg-muted/10 hover:bg-muted/20 data-[state=selected]:bg-muted transition-colors border-b-0"
										>
											<TableCell colSpan={row.getVisibleCells().length} className="p-0 border-b-0">
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.2, ease: "easeInOut" }}
													className="overflow-hidden"
												>
													<div className="p-4 border-t">{renderSubRow(row)}</div>
												</motion.div>
											</TableCell>
										</motion.tr>
									)}
								</AnimatePresence>
							</React.Fragment>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
								No results found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

// ── 3. TABLE PAGINATION (MEMOIZED CONTROLS) ──────────────────────────────────
interface TablePaginationProps<TData> {
	table: TableType<TData>;
	serverPagination?: any;
	isServerMode: boolean;
}

function TablePagination<TData>({
	table,
	serverPagination,
	isServerMode,
}: TablePaginationProps<TData>) {
	const sp = serverPagination;
	const serverCanNext = !!sp?.pagination?.has_more;
	const serverCanPrev = !!sp?.canPrev;
	const serverPage = sp ? sp.pageIndex + 1 : null;
	const serverTotal = sp?.pagination?.total ?? null;
	const serverLimit = sp?.pagination?.limit ?? null;

	return (
		<div className="flex items-center justify-between px-2 py-4">
			{isServerMode ? (
				<>
					<div className="flex-1 text-sm text-muted-foreground hidden sm:block">
						{serverTotal !== null ? `${serverTotal.toLocaleString()} row(s) total.` : null}
					</div>
					<div className="flex items-center space-x-6 lg:space-x-8">
						{serverTotal !== null && serverLimit !== null && (
							<div className="flex items-center space-x-2 hidden sm:flex">
								<p className="text-sm font-medium text-muted-foreground">Rows per page</p>
								<div className="text-sm font-medium border rounded px-2 py-1 bg-muted/20">{serverLimit}</div>
							</div>
						)}
						<div className="flex w-[100px] items-center justify-center text-sm font-medium">
							Page {serverPage} {serverTotal !== null && serverLimit !== null ? `of ${Math.ceil(serverTotal / serverLimit)}` : ""}
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								className="h-8 w-8 p-0 bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
								onClick={sp!.onPrev}
								disabled={!serverCanPrev}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0 bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
								onClick={sp!.onNext}
								disabled={!serverCanNext}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</>
			) : (
				<>
					<div className="flex-1 text-sm text-muted-foreground hidden sm:block">
						{table.getFilteredSelectedRowModel().rows.length > 0
							? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
							: `${table.getFilteredRowModel().rows.length} row(s) total.`}
					</div>
					<div className="flex items-center space-x-6 lg:space-x-8">
						<div className="flex items-center space-x-2 hidden sm:flex">
							<p className="text-sm font-medium text-muted-foreground">Rows per page</p>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="h-8 w-[70px] justify-between bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
									>
										{table.getState().pagination.pageSize}
										<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
									{[10, 20, 30, 40, 50].map((pageSize) => (
										<DropdownMenuCheckboxItem
											key={pageSize}
											checked={table.getState().pagination.pageSize === pageSize}
											onCheckedChange={() => table.setPageSize(pageSize)}
											className="rounded-lg focus:bg-muted/60"
										>
											{pageSize}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="flex w-[100px] items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<ChevronsLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0 bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0 bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex bg-background/60 border-muted/50 rounded-lg active:scale-95 duration-200 transition-all shadow-sm"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<ChevronsRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

// ── 4. MAIN DATA TABLE (COMPOSED MEMOIZED COMPONENTS) ────────────────────────
export const DataTable = React.memo(function DataTable<TData, TValue, F extends Record<string, any> = any>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Search...",
	refreshing = false,
	children,
	serverPagination,
	renderSubRow,
}: DataTableProps<TData, TValue, F>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [expanded, setExpanded] = React.useState<ExpandedState>({});

	const isServerMode = !!serverPagination;

	const tableSorting: SortingState = React.useMemo(() => {
		if (serverPagination?.sort) {
			return [
				{
					id: serverPagination.sort,
					desc: serverPagination.sortDir === "DESC",
				},
			];
		}
		return sorting;
	}, [serverPagination?.sort, serverPagination?.sortDir, sorting]);

	const table = useReactTable({
		data: data || [],
		columns,
		state: {
			sorting: tableSorting,
			columnFilters,
			rowSelection,
			expanded,
		},
		manualPagination: isServerMode,
		manualSorting: isServerMode,
		enableRowSelection: true,
		getRowCanExpand: () => true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: (updaterOrValue) => {
			if (isServerMode && serverPagination?.setSort) {
				const newValue =
					typeof updaterOrValue === "function"
						? updaterOrValue(tableSorting)
						: updaterOrValue;
				if (newValue.length > 0) {
					serverPagination.setSort(newValue[0].id, newValue[0].desc ? "DESC" : "ASC");
				} else {
					serverPagination.setSort("");
				}
			}
			setSorting(updaterOrValue);
		},
		onColumnFiltersChange: setColumnFilters,
		onExpandedChange: setExpanded,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="space-y-4">
			<TableToolbar
				table={table}
				refreshing={refreshing}
				searchKey={searchKey}
				searchPlaceholder={searchPlaceholder}
				serverPagination={serverPagination}
				isServerMode={isServerMode}
			>
				{children}
			</TableToolbar>

			<TableContent
				table={table}
				columns={columns}
				refreshing={refreshing}
				renderSubRow={renderSubRow}
			/>

			<TablePagination
				table={table}
				serverPagination={serverPagination}
				isServerMode={isServerMode}
			/>
		</div>
	);
}) as unknown as <TData, TValue, F extends Record<string, any> = any>(
	props: DataTableProps<TData, TValue, F>
) => any;
