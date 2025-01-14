'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DatabaseZapIcon, Eye, EyeOff, Link2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { LoadingSpinner } from '../icons'
import type { DatabaseConnectionConfig, DatabaseType, ConnectionMethod, ConnectionParameters, ParametersConnectionConfig, UrlConnectionConfig } from '@/types/Database'
import { DATABASE_CONFIG } from '@/utils/constants'
import { DatabaseFormInput } from './database-form'
import { connection } from 'next/server'
import { set } from 'react-hook-form'

const DEFAULT_VALUES:DatabaseConnectionConfig = {
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
    const [errors, setErrors] = useState<Partial<Record<keyof ConnectionParameters | 'connectionString', string>>>({})

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}

        if (formData.method === 'url') {
            if (!formData.connectionString?.trim()) {
                newErrors.connectionString = 'Connection string is required'
            }
        } else {
            const { parameters } = formData
            if (!parameters.host?.trim()) newErrors.host = 'Host is required'
            if (!parameters.port) newErrors.port = 'Port is required'
            if (!parameters.username?.trim()) newErrors.username = 'Username is required'
            if (!parameters.password?.trim()) newErrors.password = 'Password is required'
            if (!parameters.database?.trim()) newErrors.database = 'Database name is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validateForm()) return

        try {
            setIsConnecting(true)
            const response = await fetch('/api/database/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Connection failed')
            }

            const result = await response.json()
            if(!result.success){
                throw new Error(result.message || 'Connection failed')
            }

            toast({
                title: 'Success',
                description: 'Database connected successfully',
            })

            router.push(`/databases/view`)
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to connect to database',
                variant: 'destructive',
            })
        } finally {
            setIsConnecting(false)
        }
    }

    const updateFormData = (updates: Partial<DatabaseConnectionConfig>) => {
        setFormData(prev => {
            if (prev.method === 'parameters' && 'parameters' in updates) {
                return {
                    ...prev,
                    ...updates,
                    method: prev.method,
                    parameters: { ...prev.parameters, ...(updates.parameters as Partial<ConnectionParameters>) }
                } as DatabaseConnectionConfig;
            }
            return { ...prev, ...updates } as DatabaseConnectionConfig;
        });
    };

    const handleTypeChange = (type: DatabaseType) => {
        updateFormData(formData.method === 'parameters' 
            ? { type, parameters: { ...formData.parameters, port: DATABASE_CONFIG.PORT_MAP[type] }}
            : { type })
    }

    const handleMethodChange = (method: ConnectionMethod) => {
        updateFormData(method === 'url' 
            ? { method, connectionString: '' }
            : {
                method,
                parameters: {
                    host: 'localhost',
                    port: DATABASE_CONFIG.PORT_MAP[formData.type],
                    username: '',
                    password: '',
                    database: ''
                }
            })
    }

    const handleParameterChange = (key: keyof ConnectionParameters, value: string | number) => {
        if (formData.method === 'parameters') {
            updateFormData({
                parameters: { ...formData.parameters, [key]: value }
            })
        }
    }

    return (
        <Card className="w-full max-w-3xl mx-auto hover-card glass">
            <CardHeader className="space-y-4 text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                    <DatabaseZapIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-gradient">
                    Connect to Database
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <DatabaseTypeSelect 
                            value={formData.type}
                            onChange={handleTypeChange}
                        />

                        <Tabs
                            defaultValue="parameters"
                            onValueChange={(value) => handleMethodChange(value as ConnectionMethod)}
                            className="mt-6"
                        >
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                                <TabsTrigger value="parameters" className="data-[state=active]:bg-background">
                                    Parameters
                                </TabsTrigger>
                                <TabsTrigger value="url" className="data-[state=active]:bg-background">
                                    Connection URL
                                </TabsTrigger>
                            </TabsList>

                            {formData.method === 'parameters' ? (
                                <ParametersForm
                                    formData={formData}
                                    errors={errors}
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                    onParameterChange={handleParameterChange}
                                />
                            ) : (
                                <URLForm
                                    connectionString={formData.connectionString}
                                    error={errors.connectionString}
                                    template={DATABASE_CONFIG.CONNECTION_STRING_TEMPLATES[formData.type]}
                                    onChange={(value) => updateFormData({ connectionString: value })}
                                />
                            )}
                        </Tabs>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
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

// Separate components for better organization
function DatabaseTypeSelect({ value, onChange }: { 
    value: DatabaseType, 
    onChange: (type: DatabaseType) => void 
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Database Type
            </label>
            <Select onValueChange={onChange} value={value}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200">
                    <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(DATABASE_CONFIG.PORT_MAP).map((type) => (
                        <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

function ParametersForm({ 
    formData, 
    errors, 
    showPassword, 
    onTogglePassword, 
    onParameterChange 
}: {
    formData: DatabaseConnectionConfig & { method: 'parameters' },
    errors: Partial<Record<keyof ConnectionParameters, string>>,
    showPassword: boolean,
    onTogglePassword: () => void,
    onParameterChange: (key: keyof ConnectionParameters, value: string | number) => void
}) {
    return (
        <TabsContent value="parameters" className="space-y-6">
            <div className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <DatabaseFormInput
                        label="Host"
                        value={formData.parameters.host}
                        onChange={(e) => onParameterChange('host', e.target.value)}
                        error={errors.host}
                        placeholder="localhost"
                    />
                    <DatabaseFormInput
                        label="Port"
                        type="number"
                        value={formData.parameters.port}
                        onChange={(e) => onParameterChange('port', parseInt(e.target.value) || 0)}
                        error={errors.port}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <DatabaseFormInput
                        label="Username"
                        value={formData.parameters.username}
                        onChange={(e) => onParameterChange('username', e.target.value)}
                        error={errors.username}
                    />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.parameters.password}
                                onChange={(e) => onParameterChange('password', e.target.value)}
                                className={`${errors.password ? 'border-red-500' : ''} pr-10`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={onTogglePassword}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>
                </div>

                <DatabaseFormInput
                    label="Database Name"
                    value={formData.parameters.database}
                    onChange={(e) => onParameterChange('database', e.target.value)}
                    error={errors.database}
                />
            </div>
        </TabsContent>
    )
}

function URLForm({ 
    connectionString, 
    error, 
    template, 
    onChange 
}: {
    connectionString: string,
    error?: string,
    template: string,
    onChange: (value: string) => void
}) {
    return (
        <TabsContent value="url">
            <DatabaseFormInput
                label="Connection String"
                placeholder={template}
                value={connectionString}
                onChange={(e) => onChange(e.target.value)}
                error={error}
            />
        </TabsContent>
    )
}