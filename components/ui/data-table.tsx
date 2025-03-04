'use client'
import { useState, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    ChevronDown,
    ChevronUp,
    Download,
    Search,
    Table,
} from 'lucide-react'

// Define types for data and state
type TableRow = Record<string, any>;
type SortConfig = {
    key: string | null;
    direction: 'asc' | 'desc';
};

interface DataTableProps {
    data: TableRow[];
    onExportCSV?: () => void;
}

export function DataTable({ data, onExportCSV }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
    const [pageSize, setPageSize] = useState<number>(25)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [highlightedRows, setHighlightedRows] = useState<Set<number>>(new Set())

    // Get column headers from data
    const getColumnHeaders = useMemo(() => {
        if (data.length === 0) return []
        return Object.keys(data[0])
    }, [data])

    // Format cell values for display
    const formatCellValue = (value: any): string => {
        if (value === null || value === undefined) return '-'
        if (value instanceof Date || (typeof value === 'string' && String(value).match(/^\d{4}-\d{2}-\d{2}T/))) {
            return new Date(value).toLocaleString()
        }
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
    }

    // Format column header for display
    const formatColumnHeader = (header: string): string => {
        return header
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    // Determine if a value is numeric
    const isNumeric = (value: any): boolean => {
        if (typeof value === 'number') return true
        if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') return true
        return false
    }

    // Determine column data type for better formatting
    const getColumnType = (column: string): 'numeric' | 'date' | 'boolean' | 'text' => {
        // Check first few rows to determine type
        const sampleSize = Math.min(data.length, 5)
        let isAllNumeric = true
        let isAllDate = true
        let isAllBoolean = true

        for (let i = 0; i < sampleSize; i++) {
            const value = data[i][column]
            
            // Skip null/undefined values
            if (value === null || value === undefined) continue
            
            // Check numeric
            if (!isNumeric(value)) isAllNumeric = false
            
            // Check date
            const isDate = value instanceof Date || 
                (typeof value === 'string' && !!String(value).match(/^\d{4}-\d{2}-\d{2}/))
            if (!isDate) isAllDate = false
            
            // Check boolean
            const isBool = typeof value === 'boolean' || 
                (typeof value === 'string' && ['true', 'false', 'yes', 'no', '0', '1'].includes(value.toLowerCase()))
            if (!isBool) isAllBoolean = false
        }

        if (isAllDate) return 'date'
        if (isAllBoolean) return 'boolean'  
        if (isAllNumeric) return 'numeric'
        return 'text'
    }

    // Sort data by column
    const requestSort = (key: string): void => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter and sort data
    const getSortedData = useMemo(() => {
        let filteredData = [...data];
        
        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter(row => {
                return Object.values(row).some(value => 
                    String(value).toLowerCase().includes(term)
                );
            });
        }
        
        // Apply sorting
        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];
                
                // Handle null values
                if (aValue === null && bValue === null) return 0;
                if (aValue === null) return 1;
                if (bValue === null) return -1;
                
                // Get column type for proper sorting
                const columnType = getColumnType(sortConfig.key!);
                
                if (columnType === 'numeric') {
                    const aNum = Number(aValue);
                    const bNum = Number(bValue);
                    return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
                } else if (columnType === 'date') {
                    const aDate = new Date(aValue);
                    const bDate = new Date(bValue);
                    return sortConfig.direction === 'asc' 
                        ? aDate.getTime() - bDate.getTime() 
                        : bDate.getTime() - aDate.getTime();
                } else {
                    // Sort as strings
                    const aStr = String(aValue).toLowerCase();
                    const bStr = String(bValue).toLowerCase();
                    return sortConfig.direction === 'asc' 
                        ? aStr.localeCompare(bStr) 
                        : bStr.localeCompare(aStr);
                }
            });
        }
        
        return filteredData;
    }, [data, searchTerm, sortConfig]);

    // Get paginated subset of data
    const getPaginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return getSortedData.slice(startIndex, startIndex + pageSize);
    }, [getSortedData, currentPage, pageSize]);

    // Calculate total pages based on filtered data and page size
    const totalPages = Math.ceil(getSortedData.length / pageSize);

    // Toggle row highlighting
    const toggleRowHighlight = (rowIndex: number): void => {
        const newHighlighted = new Set(highlightedRows);
        if (newHighlighted.has(rowIndex)) {
            newHighlighted.delete(rowIndex);
        } else {
            newHighlighted.add(rowIndex);
        }
        setHighlightedRows(newHighlighted);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex items-center gap-3">
                    <Table className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Results</h3>
                    <Badge variant="secondary" className="bg-primary/10">
                        {getSortedData.length} rows
                    </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search results..."
                            className="h-8 pl-8 pr-4 w-full md:w-60 text-sm rounded-lg"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg"
                            onClick={onExportCSV}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-sm border border-border/50 overflow-hidden">
                <ScrollArea className="w-full h-[400px] custom-scrollbar">
                    <table className="w-full text-sm">
                        <thead className="bg-card sticky top-0 z-10">
                            <tr>
                                {getColumnHeaders.map((header) => {
                                    const columnType = getColumnType(header);
                                    return (
                                        <th
                                            key={header}
                                            className={cn(
                                                "sticky top-0 bg-card border-b border-border/50",
                                                "px-4 py-3 text-left font-medium font-spaceGrotesk text-sm",
                                                columnType === 'numeric' ? "text-right" : "",
                                            )}
                                        >
                                            <button 
                                                className="flex items-center gap-1 hover:text-primary transition-colors w-full"
                                                onClick={() => requestSort(header)}
                                            >
                                                <span className={cn(
                                                    columnType === 'numeric' ? "ml-auto" : "",
                                                    header === sortConfig.key ? "text-primary font-semibold" : ""
                                                )}>
                                                    {formatColumnHeader(header)}
                                                </span>
                                                {sortConfig.key === header ? (
                                                    sortConfig.direction === 'asc' 
                                                    ? <ChevronUp className="h-3 w-3 text-primary" /> 
                                                    : <ChevronDown className="h-3 w-3 text-primary" />
                                                ) : (
                                                    <div className="w-3 h-3"></div> // Placeholder for alignment
                                                )}
                                            </button>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 bg-background/60">
                            {getPaginatedData.map((row, rowIndex) => {
                                const actualIndex = rowIndex + (currentPage - 1) * pageSize;
                                const isHighlighted = highlightedRows.has(actualIndex);
                                
                                return (
                                    <tr
                                        key={rowIndex}
                                        className={cn(
                                            "hover:bg-muted/20 transition-colors cursor-pointer",
                                            isHighlighted ? "bg-primary/5 hover:bg-primary/10" : ""
                                        )}
                                        onClick={() => toggleRowHighlight(actualIndex)}
                                    >
                                        {getColumnHeaders.map((header) => {
                                            const value = row[header];
                                            const formattedValue = formatCellValue(value);
                                            const columnType = getColumnType(header);
                                            
                                            return (
                                                <td
                                                    key={`${rowIndex}-${header}`}
                                                    className={cn(
                                                        "px-4 py-3",
                                                        columnType === 'numeric' ? "text-right font-spaceMono" : "",
                                                        columnType === 'date' ? "font-spaceMono text-sm" : "",
                                                        header === sortConfig.key ? "bg-muted/10" : "",
                                                        value === null || value === undefined ? "text-muted-foreground italic" : ""
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "max-w-xs",
                                                        formattedValue.length > 40 ? "truncate" : ""
                                                    )}
                                                    title={formattedValue.length > 40 ? formattedValue : ""}>
                                                        {formattedValue}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </ScrollArea>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                        Showing {Math.min(getSortedData.length, 1 + (currentPage - 1) * pageSize)}-{Math.min(currentPage * pageSize, getSortedData.length)} of {getSortedData.length}
                    </span>
                    <select 
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page
                        }}
                        className="border rounded px-2 py-1 text-xs bg-background"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-muted-foreground">per page</span>
                </div>
                
                <div className="flex gap-1">
                    <Button 
                        variant="outline" 
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="h-8 w-8 p-0 rounded-lg"
                    >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <span className="flex items-center justify-center min-w-8 px-3 rounded-lg border h-8">
                        {currentPage}
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="h-8 w-8 p-0 rounded-lg"
                    >
                        <ChevronUp className="h-4 w-4 rotate-90" />
                    </Button>
                </div>
            </div>
        </div>
    )
}