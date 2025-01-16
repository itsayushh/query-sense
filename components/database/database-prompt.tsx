'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, Code2, Copy, PlayCircle, RotateCcw, Sparkles, Table, History, CheckCircle2, Download, Bot } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export function DatabasePrompt() {
    const [prompt, setPrompt] = useState('')
    const [generatedQuery, setGeneratedQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [queryHistory, setQueryHistory] = useState<string[]>([])
    const [tableResult, setTableResult] = useState([])
    const [activeTab, setActiveTab] = useState('query')
    const [copySuccess, setCopySuccess] = useState(false)

    const getColumnHeaders = (data: any[]) => {
        if (data.length === 0) return []
        return Object.keys(data[0])
    }

    // Helper function to format cell values
    const formatCellValue = (value: any) => {
        if (value === null || value === undefined) return '-'
        if (value instanceof Date || String(value).match(/^\d{4}-\d{2}-\d{2}T/)) {
            return new Date(value).toLocaleString()
        }
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
    }

    // Helper function to format column header
    const formatColumnHeader = (header: string) => {
        return header
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    // Helper function to export table data as CSV
    const exportToCSV = () => {
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!prompt.trim()) {
            toast({
                title: 'Empty Prompt',
                description: 'Please enter a query description.',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/execute-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            if (!response.ok) throw new Error('Failed to execute query')

            const data = await response.json()
            if (data.success) {
                setGeneratedQuery(data.query.replace('```sql', '').replace('```', ''))
                setQueryHistory(prev => [...prev, prompt])
                setTableResult(data.data)
                toast({
                    title: 'Success',
                    description: 'Query generated and executed successfully.',
                })
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to generate query',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyQuery = () => {
        navigator.clipboard.writeText(generatedQuery)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    return (
        <div className="relative">
            <Card className="border-primary/20 bg-background">
                <CardHeader className="space-y-4 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            {/* <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl" /> */}
                            <div className="relative h-full rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">AI Query Assistant</CardTitle>
                            <CardDescription className="text-base">
                                Transform natural language into powerful SQL queries
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-lg blur-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                            <Textarea
                                placeholder="What insights would you like to discover? Try: 'Show me the top 10 customers by revenue in the last quarter'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[120px] text-lg leading-relaxed resize-none
                                bg-background/30 hover:bg-background/40 focus:bg-background/50
                                border-border/40 hover:border-border/60 focus:border-primary
                                backdrop-blur-sm shadow-sm
                                transition-all duration-200"
                            />
                            {prompt && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPrompt('')}
                                    className="absolute top-2 right-2 text-muted-foreground/60 hover:text-muted-foreground"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70
                                shadow-lg hover:shadow-xl
                                transition-all duration-300 hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Generate Query
                                    </>
                                )}
                            </Button>
                            {queryHistory.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="group relative px-4"
                                >
                                    <History className="h-5 w-5 text-primary" />
                                    <Badge className="ml-2 bg-primary/20 text-primary">
                                        {queryHistory.length}
                                    </Badge>
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Query Results Section */}
                    {generatedQuery && (
                        <div className="mt-8 space-y-6">
                            <Tabs defaultValue="query" className="w-full">
                                <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1">
                                    <TabsTrigger
                                        value="query"
                                        className="data-[state=active]:bg-background"
                                    >
                                        <Code2 className="h-4 w-4 mr-2" />
                                        SQL Query
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="results"
                                        className="data-[state=active]:bg-background"
                                    >
                                        <Table className="h-4 w-4 mr-2" />
                                        Results
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="query" className="mt-4">
                                    <div className="rounded-lg border border-border/40 overflow-hidden">
                                        <div className="bg-muted/30 p-3 flex justify-between items-center border-b border-border/40">
                                            <div className="flex items-center gap-2">
                                                <Code2 className="h-4 w-4 text-primary" />
                                                <span className="font-medium">Generated SQL</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleCopyQuery}
                                                className="hover:bg-background/50"
                                            >
                                                {copySuccess ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <pre className="p-4 overflow-x-auto bg-secondary/30">
                                            <code className="text-sm font-spaceMono">{generatedQuery}</code>
                                        </pre>
                                    </div>
                                </TabsContent>

                                <TabsContent value="results" className="space-y-4">
                                    <div className="flex justify-between items-center mb-4 ">
                                        <div className="flex items-center gap-2">
                                            <Table className="h-4 w-4 text-primary" />
                                            <h3 className="font-semibold">Query Results</h3>
                                            {tableResult.length > 0 && (
                                                <Badge variant="secondary">
                                                    {tableResult.length} {tableResult.length === 1 ? 'row' : 'rows'}
                                                </Badge>
                                            )}
                                        </div>
                                        {tableResult.length > 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={exportToCSV}
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Export CSV
                                            </Button>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-border/40 shadow-sm bg-muted/30 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm ">
                                                {tableResult.length > 0 ? (
                                                    <>
                                                        <thead className="bg-muted/90">
                                                            <tr>
                                                                {getColumnHeaders(tableResult).map((header) => (
                                                                    <th
                                                                        key={header}
                                                                        className="px-6 py-4 text-left font-spaceMono text-base"
                                                                    >
                                                                        {formatColumnHeader(header)}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/40">
                                                            {tableResult.map((row, rowIndex) => (
                                                                <tr
                                                                    key={rowIndex}
                                                                    className="hover:bg-muted/30 transition-colors"
                                                                >
                                                                    {getColumnHeaders(tableResult).map((header) => (
                                                                        <td
                                                                            key={`${rowIndex}-${header}`}
                                                                            className="px-6 py-4 whitespace-nowrap"
                                                                        >
                                                                            <div className="max-w-xs truncate">
                                                                                {formatCellValue(row[header])}
                                                                            </div>
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </>
                                                ) : (
                                                    <tbody>
                                                        <tr>
                                                            <td className="px-6 py-8 text-center text-muted-foreground">
                                                                No results to display. Execute the query to see data.
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {!generatedQuery && !isLoading && (
                        <Alert className="bg-primary/5 border-primary/20">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <AlertDescription className="text-base">
                                Be specific in your query description for better results. Include timeframes, conditions, and desired outputs.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}