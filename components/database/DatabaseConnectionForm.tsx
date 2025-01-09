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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Cable, DatabaseIcon, DatabaseZapIcon, Eye, EyeOff, Icon, KeyIcon, Link2Icon, ServerIcon, UserIcon } from 'lucide-react'
import { LoadingSpinner } from '../icons'
import { ConnectionMethod, ConnectionParameters, DatabaseConnectionConfig, DatabaseType, ParametersConnectionConfig, UrlConnectionConfig } from '@/types/Database'

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

const FormInput = ({
    label,
    error,
    icon: Icon,
    ...props
}: {
    label: string
    error?: string
    icon?: React.ComponentType<any>
} & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300">
                    <Icon className="h-4 w-4" />
                </div>
            )}
            <Input
                {...props}
                className={`${error ? 'border-red-500' : ''} ${Icon ? 'pl-9' : ''} bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200`}
            />
        </div>
        {error && (
            <p className="text-sm text-red-500">{error}</p>
        )}
    </div>
)


export function DatabaseConnectionForm() {
    const router = useRouter()
    const [isConnecting, setIsConnecting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState<DatabaseConnectionConfig>(DEFAULT_VALUES)
    const [errors, setErrors] = useState<Partial<Record<keyof ConnectionParameters | 'connectionString', string>>>({})

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}

        if (formData.method === 'url') {
            if (!formData.connectionString) {
                newErrors.connectionString = 'Connection string is required'
            }
        } else {
            const { parameters } = formData
            if (!parameters.host) newErrors.host = 'Host is required'
            if (!parameters.port) newErrors.port = 'Port is required'
            if (!parameters.username) newErrors.username = 'Username is required'
            if (!parameters.password) newErrors.password = 'Password is required'
            if (!parameters.database) newErrors.database = 'Database name is required'
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

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Connection failed')

            toast({
                title: 'Success',
                description: 'Database connected successfully',
            })

            router.push(`/databases/view?${new URLSearchParams({
                tables: JSON.stringify(result.tables),
            })}`)
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
        setFormData(prev => {
            if (prev.method === 'parameters') {
                return {
                    ...prev,
                    type,
                    parameters: {
                        ...prev.parameters,
                        port: PORT_MAP[type]
                    }
                }
            }
            return {
                type,
                method: 'url',
                connectionString: prev.connectionString
            }
        })
    }

    const handleMethodChange = (method: ConnectionMethod) => {
        if (method === 'url') {
            setFormData({
                type: formData.type,
                method: 'url',
                connectionString: ''
            })
        } else {
            setFormData({
                type: formData.type,
                method: 'parameters',
                parameters: {
                    host: 'localhost',
                    port: PORT_MAP[formData.type],
                    username: '',
                    password: '',
                    database: ''
                }
            })
        }
    }

    const handleParameterChange = (
        key: keyof ConnectionParameters,
        value: string | number
    ) => {
        if (formData.method === 'parameters') {
            setFormData(prev => ({
                ...prev,
                parameters: {
                    ...prev.parameters,
                    [key]: value
                }
            }))
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Database Type
                            </label>
                            <Select
                                onValueChange={handleTypeChange}
                                value={formData.type}
                            >
                                <SelectTrigger className="bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200">
                                    <SelectValue placeholder="Select database type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(PORT_MAP).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            <div className="flex items-center gap-2">
                                                <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                                                {/* <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300">
                                                </div> */}
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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

                            <TabsContent value="parameters" className="space-y-6">
                                {formData.method === 'parameters' && (
                                    <div className="grid gap-6">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormInput
                                                label="Host"
                                                placeholder="localhost"
                                                value={formData.parameters.host}
                                                onChange={(e) => handleParameterChange('host', e.target.value)}
                                                error={errors.host}
                                                icon={ServerIcon}

                                            />
                                            <FormInput
                                                label="Port"
                                                type="number"
                                                value={formData.parameters.port}
                                                onChange={(e) => handleParameterChange('port', parseInt(e.target.value) || 0)}
                                                error={errors.port}
                                                icon={Cable}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormInput
                                                label="Username"
                                                value={formData.parameters.username}
                                                onChange={(e) => handleParameterChange('username', e.target.value)}
                                                error={errors.username}
                                                icon={UserIcon}
                                            />
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300 h-4 w-4" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.parameters.password}
                                                        onChange={(e) => handleParameterChange('password', e.target.value)}
                                                        className={`${errors.password ? 'border-red-500' : ''} pl-9 pr-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200`}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {errors.password && (
                                                    <p className="text-sm text-red-500">{errors.password}</p>
                                                )}
                                            </div>
                                        </div>

                                        <FormInput
                                            label="Database Name"
                                            value={formData.parameters.database}
                                            onChange={(e) => handleParameterChange('database', e.target.value)}
                                            error={errors.database}
                                            icon={DatabaseIcon}
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="url">
                                {formData.method === 'url' && (
                                    <FormInput
                                        label="Connection String"
                                        placeholder={CONNECTION_STRING_TEMPLATES[formData.type]}
                                        value={formData.connectionString}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            connectionString: e.target.value
                                        }))}
                                        error={errors.connectionString}
                                        icon={Link2Icon}
                                    />
                                )}
                            </TabsContent>
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