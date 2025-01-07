'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Code2, Copy, PlayCircle, RotateCcw, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DatabasePrompt() {
    const [prompt, setPrompt] = useState('')
    const [generatedQuery, setGeneratedQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [queryHistory, setQueryHistory] = useState<string[]>([])
    const searchParams = useSearchParams()

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
            // const connectionDetails = {
            //     // type: searchParams.get('type'),
            //     // host: searchParams.get('host'),
            //     // port: Number(searchParams.get('port')),
            //     // username: searchParams.get('username'),
            //     // password: searchParams.get('password'),
            //     // database: searchParams.get('database'),
            //     tables: JSON.parse(searchParams.get('tables') || '[]')
            // }

            const response = await fetch('/api/execute-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    tables:JSON.parse(searchParams.get('tables') || '[]'),
                }),
            })

            if (!response.ok) throw new Error('Failed to execute query')

            const data = await response.json()
            if (data.success) {
                setGeneratedQuery(data.query.replace('```sql', '').replace('```', ''))
                setQueryHistory(prev => [...prev, prompt])
                toast({
                    title: 'Query Generated',
                    description: 'SQL query has been generated successfully.',
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
        toast({
            title: 'Copied',
            description: 'Query copied to clipboard',
        })
    }

    const handleReset = () => {
        setPrompt('')
        setGeneratedQuery('')
    }

    return (
        <div className="space-y-6">
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Natural Language to SQL
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Textarea
                                placeholder="Describe your query in natural language, e.g. 'Show me all users who joined in the last month'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[120px] pr-12 resize-none"
                            />
                            {prompt && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                className="flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                        Generating Query...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Query
                                    </>
                                )}
                            </Button>
                            {queryHistory.length > 0 && (
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setPrompt(queryHistory[queryHistory.length - 1])}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>

                    {!generatedQuery && !isLoading && (
                        <Alert variant="default" className="bg-muted/50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Describe what you want to query in plain English. The more specific you are, the better the results will be.
                            </AlertDescription>
                        </Alert>
                    )}

                    {generatedQuery && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-primary" />
                                    Generated SQL Query
                                </h3>
                                <div className="flex gap-2 ">
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={handleCopyQuery}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                    >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Execute
                                    </Button>
                                </div>
                            </div>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm border border-border/40 relative group">
                                <code className="whitespace-pre-wrap font-mono text-sm">
                                    {generatedQuery}
                                </code>
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}