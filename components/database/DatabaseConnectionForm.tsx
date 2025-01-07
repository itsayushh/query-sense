'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { DatabaseIcon, Eye, EyeOff, Link2Icon } from 'lucide-react'
import { LoadingSpinner } from '../icons'
import { ConnectionMethod, ConnectionResult, DatabaseConnectionConfig, DatabaseType, ParametersConnectionConfig, UrlConnectionConfig } from '@/types/Database'

const PORT_MAP: Record<DatabaseType, number> = {
    mysql: 3306,
    postgresql: 5432,
    mongodb: 27017,
    sqlite: 0,
}

const CONNECTION_STRING_TEMPLATES: Record<DatabaseType, string> = {
    mysql: 'mysql://user:password@localhost:3306/dbname',
    postgresql: 'postgresql://user:password@localhost:5432/dbname',
    mongodb: 'mongodb+srv://user:password@cluster.xxxxx.mongodb.net/dbname',
    sqlite: '/path/to/database.sqlite',
}

const DEFAULT_VALUES: ParametersConnectionConfig = {
    type: 'mysql',
    method: 'parameters',
    parameters: {
        host: 'localhost',
        port: 3306,
        username: '',
        password: '',
        database: '',
    }
}

export function DatabaseConnectionForm() {
    const router = useRouter()
    const [isConnecting, setIsConnecting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState<DatabaseConnectionConfig>(DEFAULT_VALUES)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (formData.method === 'url') {
            if (!formData.connectionString) {
                newErrors.connectionString = 'Connection string is required'
            }
        } else {
            if (!formData.parameters.host) newErrors.host = 'Host is required'
            if (!formData.parameters.port) newErrors.port = 'Port is required'
            if (!formData.parameters.username) newErrors.username = 'Username is required'
            if (!formData.parameters.password) newErrors.password = 'Password is required'
            if (!formData.parameters.database) newErrors.database = 'Database name is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        try {
            setIsConnecting(true)
            const response = await fetch('/api/database/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result: ConnectionResult = await response.json()

            if (!response.ok) throw new Error(result.error || 'Connection failed')

            toast({
                title: 'Success',
                description: 'Database connected successfully',
            })

            console.log('table->',result)
            const searchParams = new URLSearchParams({
                tables: JSON.stringify(result.tables),
            })

            router.push(`/databases/view?${searchParams.toString()}`)
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Connection failed',
                variant: 'destructive',
            })
        } finally {
            setIsConnecting(false)
        }
    }

    const handleTypeChange = (type: DatabaseType) => {
        if (formData.method === 'parameters') {
            setFormData(prev => ({
                ...prev,
                type,
                parameters: {
                    ...prev.parameters,
                    port: PORT_MAP[type]
                }
            }))
        } else {
            setFormData(prev => ({
                type,
                method: 'url',
                connectionString: prev.connectionString
            }))
        }
    }

    const handleMethodChange = (method: ConnectionMethod) => {
        if (method === 'url') {
            const urlConfig: UrlConnectionConfig = {
                type: formData.type,
                method: 'url',
                connectionString: ''
            }
            setFormData(urlConfig)
        } else {
            const paramConfig: ParametersConnectionConfig = {
                type: formData.type,
                method: 'parameters',
                parameters: {
                    host: 'localhost',
                    port: PORT_MAP[formData.type],
                    username: '',
                    password: '',
                    database: ''
                }
            }
            setFormData(paramConfig)
        }
    }

    return (
        <Card className="w-full max-w-3xl mx-auto border-2 border-primary/40 p-8">
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Database Type
                        </label>
                        <Select
                            onValueChange={(value: DatabaseType) => handleTypeChange(value)}
                            value={formData.type}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select database type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PORT_MAP).map(([type]) => (
                                    <SelectItem key={type} value={type}>
                                        <div className="flex items-center gap-2">
                                            <DatabaseIcon className="h-4 w-4" />
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm font-medium text-destructive">{errors.type}</p>}
                    </div>

                    <Tabs
                        defaultValue="parameters"
                        onValueChange={(value) => handleMethodChange(value as ConnectionMethod)}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="parameters">Connection Parameters</TabsTrigger>
                            <TabsTrigger value="url">Connection URL</TabsTrigger>
                        </TabsList>

                        <TabsContent value="parameters">
                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Host
                                        </label>
                                        <Input 
                                            placeholder="localhost"
                                            value={formData.method === 'parameters' ? formData.parameters.host : ''}
                                            onChange={(e) => {
                                                if (formData.method === 'parameters') {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        parameters: {
                                                            ...prev.parameters,
                                                            host: e.target.value
                                                        }
                                                    }))
                                                }
                                            }}
                                        />
                                        {errors.host && <p className="text-sm font-medium text-destructive">{errors.host}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Port
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.method === 'parameters' ? formData.parameters.port : ''}
                                            onChange={(e) => {
                                                if (formData.method === 'parameters') {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        parameters: {
                                                            ...prev.parameters,
                                                            port: parseInt(e.target.value) || 0
                                                        }
                                                    }))
                                                }
                                            }}
                                        />
                                        {errors.port && <p className="text-sm font-medium text-destructive">{errors.port}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Username
                                        </label>
                                        <Input
                                            value={formData.method === 'parameters' ? formData.parameters.username : ''}
                                            onChange={(e) => {
                                                if (formData.method === 'parameters') {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        parameters: {
                                                            ...prev.parameters,
                                                            username: e.target.value
                                                        }
                                                    }))
                                                }
                                            }}
                                        />
                                        {errors.username && <p className="text-sm font-medium text-destructive">{errors.username}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.method === 'parameters' ? formData.parameters.password : ''}
                                                onChange={(e) => {
                                                    if (formData.method === 'parameters') {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            parameters: {
                                                                ...prev.parameters,
                                                                password: e.target.value
                                                            }
                                                        }))
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password && <p className="text-sm font-medium text-destructive">{errors.password}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Database Name
                                    </label>
                                    <Input
                                        value={formData.method === 'parameters' ? formData.parameters.database : ''}
                                        onChange={(e) => {
                                            if (formData.method === 'parameters') {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    parameters: {
                                                        ...prev.parameters,
                                                        database: e.target.value
                                                    }
                                                }))
                                            }
                                        }}
                                    />
                                    {errors.database && <p className="text-sm font-medium text-destructive">{errors.database}</p>}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="url">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Connection String
                                </label>
                                <Input
                                    placeholder={CONNECTION_STRING_TEMPLATES[formData.type]}
                                    value={formData.method === 'url' ? formData.connectionString : ''}
                                    onChange={(e) => {
                                        if (formData.method === 'url') {
                                            setFormData(prev => ({
                                                type: prev.type,
                                                method: 'url',
                                                connectionString: e.target.value
                                            }))
                                        }
                                    }}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter your database connection string including credentials
                                </p>
                                {errors.connectionString && <p className="text-sm font-medium text-destructive">{errors.connectionString}</p>}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <>
                                <LoadingSpinner className="mr-2" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Link2Icon className="mr-2" />
                                Connect Database
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}