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
        <div className="space-y-5">
            {/* Hero Section with Improved Visual Hierarchy */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-5">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent" />
                </div>

                <div className="relative flex items-start gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Bot className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">AI Query Assistant</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Transform your questions into powerful SQL queries using natural language.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Query Interface */}
            <Card className="border-primary/10 shadow-lg">
                <CardContent className="p-6 space-y-6">
                    {/* Query Input */}
                    <div className="relative">
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What insights would you like to discover? Try: 'Show me the top 10 customers by revenue in the last quarter'"
                            className="min-h-[120px] text-lg leading-relaxed p-6 rounded-xl
                bg-muted/30 border-primary/10 focus:border-primary/20
                shadow-sm transition-all duration-200"
                        />

                        {prompt && (
                            <Button
                                onClick={() => setPrompt('')}
                                variant="ghost"
                                size="sm"
                                className="absolute top-3 right-3 text-muted-foreground/60"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 h-12 text-lg font-medium bg-primary hover:bg-primary/90
                transition-all duration-200 rounded-xl"
                        >
                            {isLoading ? (
                                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-5 w-5" />
                            )}
                            {isLoading ? 'Generating Query...' : 'Generate Query'}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-12 h-12 rounded-xl"
                        >
                            <History className="h-5 w-5 text-primary" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section with Improved Layout */}
            {generatedQuery && (
                <div className="bg-card rounded-xl border border-primary/10 shadow-lg overflow-hidden">
                    <Tabs defaultValue="query" className="w-full">
                        <div className="px-6 pt-6">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1">
                                <TabsTrigger value="query" className="rounded-lg">
                                    <Code2 className="h-4 w-4 mr-2" />
                                    SQL Query
                                </TabsTrigger>
                                <TabsTrigger value="results" className="rounded-lg">
                                    <Table className="h-4 w-4 mr-2" />
                                    Results
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="query" className="p-6">
                            <div className="rounded-xl border border-primary/10 overflow-hidden">
                                <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Generated SQL</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCopyQuery}
                                        className="hover:bg-primary/10"
                                    >
                                        {copySuccess ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <pre className="p-4 bg-muted/20">
                                    <code className="text-sm font-mono">{generatedQuery}</code>
                                </pre>
                            </div>
                        </TabsContent>

                        <TabsContent value="results" className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Table className="h-4 w-4 text-primary" />
                                        <h3 className="font-medium">Query Results</h3>
                                        <Badge variant="secondary" className="bg-primary/10">
                                            {tableResult.length} rows
                                        </Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg"
                                        onClick={exportToCSV}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                </div>

                                <div className="rounded-xl border border-primary/10 overflow-hidden">
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
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}