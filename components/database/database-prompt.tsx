'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Wand2,
    Send,
    Copy,
    CheckCircle2,
    Download,
    Sparkles,
    Zap,
    Code2,
    Table,
    Bot,
    ChevronDown,
    ChevronUp,
    Search,
    FileDown,
    Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

// Define types for our data and state
type TableRow = Record<string, any>;
type SortConfig = {
    key: string | null;
    direction: 'asc' | 'desc';
};

interface QueryResponse {
    success: boolean;
    message?: string;
    data?: TableRow[];
    query?: string;
}

export default function DatabasePrompt() {
    const [prompt, setPrompt] = useState<string>('')
    const [generatedQuery, setGeneratedQuery] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [tableResult, setTableResult] = useState<TableRow[]>([])
    const [copySuccess, setCopySuccess] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
    const [pageSize, setPageSize] = useState<number>(25)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [highlightedRows, setHighlightedRows] = useState<Set<number>>(new Set())

    // Get column headers from data
    const getColumnHeaders = (data: TableRow[]): string[] => {
        if (data.length === 0) return []
        return Object.keys(data[0])
    }

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
        const sampleSize = Math.min(tableResult.length, 5)
        let isAllNumeric = true
        let isAllDate = true
        let isAllBoolean = true

        for (let i = 0; i < sampleSize; i++) {
            const value = tableResult[i][column]
            
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
    const getSortedData = (): TableRow[] => {
        let filteredData = [...tableResult];
        
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
    };

    // Get paginated subset of data
    const getPaginatedData = (): TableRow[] => {
        const sortedData = getSortedData();
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    };

    // Calculate total pages based on filtered data and page size
    const totalPages = Math.ceil(getSortedData().length / pageSize);

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
    
    // Export table data as CSV
    const exportToCSV = (): void => {
        if (tableResult.length === 0) return

        const headers = getColumnHeaders(tableResult)
        const csvContent = [
            headers.join(','),
            ...tableResult.map(row =>
                headers.map(header => JSON.stringify(row[header])).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'query_results.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    // Export as Excel (placeholder)
    const exportToExcel = (): void => {
        if (tableResult.length === 0) return
        
        toast({
            title: 'Export Started',
            description: 'Preparing Excel file for download...',
        })
        
        // In a real implementation, you would use a library like xlsx here
        setTimeout(() => {
            toast({
                title: 'Feature Not Implemented',
                description: 'Excel export would be here in the full implementation.',
                variant: 'destructive',
            })
        }, 1000)
    }

    // Handle form submission
    async function handleSubmit(): Promise<void> {
        if (!prompt.trim()) {
            toast({
                title: 'Empty Prompt',
                description: 'Please describe your query intention.',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsLoading(true)
            // First, generate the query
            const generateResponse = await fetch('/api/query/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            const generateData: QueryResponse = await generateResponse.json()
            if (!generateData.success || !generateData.query) {
                throw new Error(generateData.message || 'Failed to generate query')
            }

            const generatedQuery = generateData.query.replace('```sql', '').replace('```', '')
            setGeneratedQuery(generatedQuery)

            // Then, execute the generated query
            const executeResponse = await fetch('/api/query/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: generatedQuery }),
            })

            const executeData: QueryResponse = await executeResponse.json()
            if (executeData.success && executeData.data) {
                setTableResult(executeData.data)
                // Reset pagination when new data arrives
                setCurrentPage(1)
                setSortConfig({ key: null, direction: 'asc' })
                setSearchTerm('')
                setHighlightedRows(new Set())
                toast({
                    title: 'Success',
                    description: 'Query generated and executed successfully.',
                })
            } else {
                throw new Error(executeData.message || 'Failed to execute query')
            }
        } catch (error) {
            toast({
                title: 'Query Generation Failed',
                description: error instanceof Error
                    ? error.message
                    : 'Unable to generate query',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Prompt Section */}
            <Card className="border-primary/10 shadow-sm">
                <CardHeader className="py-3 px-4 bg-card border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Bot className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-outfit">AI Query Assistant</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="relative group">
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What insights would you like to discover? Try: 'Show me the top 10 customers by revenue in the last quarter'"
                            className="min-h-[120px] pr-16 text-xl 
                            border-primary/20 focus:border-primary/40 
                            rounded-xl transition-all duration-300"
                        />

                        {/* Action Buttons */}
                        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                            {prompt && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full 
                                    text-muted-foreground hover:bg-primary/10"
                                    onClick={() => setPrompt('')}
                                >
                                    <Zap className="h-4 w-4" />
                                </Button>
                            )}

                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || !prompt.trim()}
                                className="group flex items-center gap-2 
                                bg-primary text-primary-foreground 
                                hover:bg-primary/90 rounded-xl 
                                transition-all duration-300"
                            >
                                {isLoading ? (
                                    <Sparkles className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {isLoading ? 'Generating...' : 'Generate Query'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Query and Results Section */}
            {generatedQuery && (
                <Card className="border-primary/10 shadow-sm">
                    <CardContent className="p-4">
                        <Tabs defaultValue="query" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 mb-4">
                                <TabsTrigger value="query" className="rounded-lg">
                                    <Code2 className="h-4 w-4 mr-2" />
                                    SQL Query
                                </TabsTrigger>
                                <TabsTrigger
                                    value="results"
                                    disabled={tableResult.length === 0}
                                    className="rounded-lg"
                                >
                                    <Table className="h-4 w-4 mr-2" />
                                    Results
                                    {tableResult.length > 0 && (
                                        <Badge variant="secondary" className="ml-2 bg-primary/10">
                                            {tableResult.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="query">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Wand2 className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-sm">Generated SQL</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedQuery)
                                            setCopySuccess(true)
                                            setTimeout(() => setCopySuccess(false), 2000)
                                        }}
                                    >
                                        {copySuccess ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <pre className="bg-muted/30 p-3 rounded-lg overflow-x-auto text-sm font-mono">
                                    {generatedQuery}
                                </pre>
                            </TabsContent>

                            <TabsContent value="results">
                                {tableResult.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                            <div className="flex items-center gap-3">
                                                <Table className="h-4 w-4 text-primary" />
                                                <h3 className="font-medium">Query Results</h3>
                                                <Badge variant="secondary" className="bg-primary/10">
                                                    {getSortedData().length} rows
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
                                                        onClick={exportToCSV}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        CSV
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent"
                                                        onClick={exportToExcel}
                                                    >
                                                        <FileDown className="h-4 w-4 mr-2" />
                                                        Excel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-border/50 overflow-hidden">
                                            <ScrollArea className="w-full h-[400px] custom-scrollbar">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-card sticky top-0 z-10">
                                                        <tr>
                                                            {getColumnHeaders(tableResult).map((header) => {
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
                                                        {getPaginatedData().map((row, rowIndex) => {
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
                                                                    {getColumnHeaders(tableResult).map((header) => {
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
                                                    Showing {Math.min(getSortedData().length, 1 + (currentPage - 1) * pageSize)}-{Math.min(currentPage * pageSize, getSortedData().length)} of {getSortedData().length}
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
                                                    <ChevronUp className="h-4 w-4 rotate-90" />
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
                                                    <ChevronDown className="h-4 w-4 rotate-90" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                                        <Info className="h-12 w-12 text-muted-foreground/50" />
                                        <div>
                                            <p className="text-lg font-medium">No results to display</p>
                                            <p className="text-sm">Execute the query to see data.</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}