'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Wand2,
    Send,
    Copy,
    CheckCircle2,
    Sparkles,
    Zap,
    Code2,
    Table,
    Bot,
    Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DataTable } from '../ui/data-table'
import { FreeQueryStatus } from '../free-query-status'
import { useFreeQueries } from '@/contexts/FreeQueryContext'

// Define types for our data and state
type TableRow = Record<string, any>;

interface QueryResponse {
    success: boolean;
    message?: string;
    data?: TableRow[];
    query?: string;
    shouldConsumeQuery?: boolean;
}

export default function DatabasePrompt() {
    const { isSignedIn } = useUser()
    const { canMakeQuery, hasExhaustedQueries, consumeQuery } = useFreeQueries()
    const [prompt, setPrompt] = useState<string>('')
    const [generatedQuery, setGeneratedQuery] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [tableResult, setTableResult] = useState<TableRow[]>([])
    const [copySuccess, setCopySuccess] = useState<boolean>(false)

    // Export table data as CSV
    const exportToCSV = (): void => {
        if (tableResult.length === 0) return

        const headers = Object.keys(tableResult[0])
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

        // Check if user can make a query (either signed in or has free queries)
        if (!canMakeQuery) {
            toast({
                title: 'Query Limit Reached',
                description: 'You have used all your free queries. Please sign in to continue.',
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
                
                // Consume free query if suggested by API
                if (executeData.shouldConsumeQuery) {
                    consumeQuery()
                }
                
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
        <div className="space-y-4">
            {/* Free Query Status Alert */}
            {hasExhaustedQueries && (
                <FreeQueryStatus variant="alert" showLoginButton={true} />
            )}
            
            {/* Prompt Section */}
            <Card className="border-primary/10 shadow-sm ">
                <CardHeader className="py-3 px-4 bg-card border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Bot className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-outfit">AI Query Assistant</CardTitle>
                        </div>
                        {/* Compact free query status in header */}
                        {!isSignedIn && !hasExhaustedQueries && (
                            <FreeQueryStatus variant="badge" showLoginButton={false} />
                        )}
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
                                disabled={isLoading || !prompt.trim() || (!isSignedIn && !canMakeQuery)}
                                className="group flex items-center gap-2 
                                bg-primary text-primary-foreground 
                                hover:bg-primary/90 rounded-xl 
                                transition-all duration-300
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Sparkles className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {isLoading ? 'Generating...' : 
                                 !isSignedIn && !canMakeQuery ? 'Sign In Required' : 
                                 'Generate Query'}
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
                                <pre className="bg-muted/30 p-3 rounded-lg overflow-x-auto text-sm font-jetbrainsMono">
                                    {generatedQuery}
                                </pre>
                            </TabsContent>

                            <TabsContent value="results">
                                {tableResult.length > 0 ? (
                                    <DataTable 
                                        data={tableResult}
                                        onExportCSV={exportToCSV}
                                    />
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