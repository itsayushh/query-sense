'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, Code2, Copy, PlayCircle, RotateCcw, Sparkles, Table, History, CheckCircle2, Download } from 'lucide-react'
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
        <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        AI Query Assistant
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Transform natural language into powerful SQL queries
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <Textarea
                                placeholder="What insights would you like to discover? Try: 'Show me the top 10 customers by revenue in the last quarter'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[120px] text-lg leading-relaxed resize-none transition-all duration-200 focus:shadow-md focus:border-primary"
                            />
                            {prompt && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setPrompt('')}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-12 text-lg font-medium transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80"
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
                                    className="group relative hover:bg-muted/50"
                                >
                                    <History className="h-5 w-5" />
                                    <Badge className="ml-2 bg-primary/20 text-primary">
                                        {queryHistory.length}
                                    </Badge>
                                </Button>
                            )}
                        </div>
                    </form>

                    {!generatedQuery && !isLoading && (
                        <Alert className="bg-muted/50 border-primary/20">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <AlertDescription className="text-base">
                                Be specific in your query description for better results. Include timeframes, conditions, and desired outputs.
                            </AlertDescription>
                        </Alert>
                    )}

                    {generatedQuery && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                                <TabsTrigger
                                    value="query"
                                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Code2 className="h-4 w-4" />
                                    SQL Query
                                </TabsTrigger>
                                <TabsTrigger
                                    value="result"
                                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Table className="h-4 w-4" />
                                    Results
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="query" className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Code2 className="h-4 w-4 text-primary" />
                                        Generated SQL
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCopyQuery}
                                            className="hover:bg-primary/10"
                                        >
                                            {copySuccess ? (
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            {copySuccess ? 'Copied!' : 'Copy'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Execute
                                        </Button>
                                    </div>
                                </div>
                                <pre className="bg-muted/30 p-6 rounded-lg overflow-x-auto text-sm border border-border/40 transition-all duration-200 hover:shadow-md">
                                    <code className="font-mono text-sm">
                                        {generatedQuery}
                                    </code>
                                </pre>
                            </TabsContent>

                            <TabsContent value="result" className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
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
                        <table className="w-full text-sm">
                            {tableResult.length > 0 ? (
                                <>
                                    <thead className="bg-muted/90">
                                        <tr>
                                            {getColumnHeaders(tableResult).map((header) => (
                                                <th
                                                    key={header}
                                                    className="px-6 py-4 text-left font-semibold whitespace-nowrap"
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}