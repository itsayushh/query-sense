'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cable, DatabaseIcon, DatabaseZapIcon, Eye, EyeClosed, Link2Icon, ServerIcon, UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { LoadingSpinner } from '../icons'
import type { DatabaseConnectionConfig, DatabaseType, ConnectionMethod, ConnectionParameters } from '@/types/Database'
import { DATABASE_CONFIG } from '@/utils/constants'
import { DatabaseFormInput } from './database-form'
import { KeyIcon } from 'lucide-react'

const DEFAULT_VALUES: DatabaseConnectionConfig = {
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
            if (!result.success) {
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
            ? { type, parameters: { ...formData.parameters, port: DATABASE_CONFIG.PORT_MAP[type] } }
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
        <Card className="w-[80%] hover-card flex flex-row items-center justify-between p-5 glass ">
            <CardHeader className="space-y-8 text-center py-10 bg-background">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                            <DatabaseZapIcon className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-semibold tracking-tight">
                            Connect Database
                        </CardTitle>
                        <p className="mt-2 text-xl text-muted-foreground">
                            Configure your database connection settings
                        </p>
                    </div>
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
        <div className="space-y-4">
            <label className="text-sm font-medium">
                Database Type
            </label>
            <Select
                value={value}
                onValueChange={onChange}
            >
                <SelectTrigger className="h-12 w-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300">
                    <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2">
                        {Object.keys(DATABASE_CONFIG.PORT_MAP).map((type) => (
                            <SelectItem
                                key={type}
                                value={type}
                                className="h-11 rounded-md hover:bg-primary/10 focus:bg-primary/10 transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <DatabaseIcon className="w-4 h-4 mr-2 text-primary" />
                                    <span className="capitalize">{type}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </div>
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
                        icon={ServerIcon}
                        className='text-5xl'
                    />
                    <DatabaseFormInput
                        label="Port"
                        type="number"
                        value={formData.parameters.port}
                        onChange={(e) => onParameterChange('port', parseInt(e.target.value) || 0)}
                        error={errors.port}
                        icon={Cable}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <DatabaseFormInput
                        label="Username"
                        value={formData.parameters.username}
                        onChange={(e) => onParameterChange('username', e.target.value)}
                        error={errors.username}
                        icon={UserIcon}
                    />
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-base font-medium mb-2">
                            Password
                        </label>
                        <div className="relative group">
                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary h-5 w-5" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.parameters.password}
                                style={{ fontSize: '1.08rem' }} // Additional backup using inline style
                                onChange={(e) => onParameterChange('password', e.target.value)}
                                className={`
                                                          h-12 bg-background/50 backdrop-blur-sm
                                                          border border-input/50 hover:border-input
                                                          focus:border-primary focus:ring-1 focus:ring-primary
                                                          transition-all duration-200 pl-11
                                                            ${errors.password ? 'border-red-500' : 'border-border/50'}
                                                        `}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={onTogglePassword}
                            >
                                {showPassword ? (
                                    <EyeClosed className="h-4 w-4 text-muted-foreground/60" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground/60" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                </div>
                    <DatabaseFormInput
                        label="Database Name"
                        value={formData.parameters.database}
                        onChange={(e) => onParameterChange('database', e.target.value)}
                        error={errors.database}
                        icon={DatabaseIcon}
                    />
            </div>
        </TabsContent >
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
        <TabsContent value="url" className="space-y-6 w-[30vw]">
            
            <DatabaseFormInput
                label="Connection String"
                placeholder={template}
                value={connectionString}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                icon={Link2Icon}
            />
        </TabsContent>
    )
}