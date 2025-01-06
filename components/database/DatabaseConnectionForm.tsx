'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { DatabaseIcon, Eye, EyeOff } from 'lucide-react'
import { LoadingSpinner } from '../icons'

const formSchema = z.object({
  type: z.enum(['mysql', 'postgresql', 'mongodb', 'sqlite']),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().min(1).max(65535),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  database: z.string().min(1, 'Database name is required'),
})

type FormData = z.infer<typeof formSchema>

const DEFAULT_VALUES: Partial<FormData> = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: '',
  password: '',
  database: '',
}

const PORT_MAP = {
  mysql: 3306,
  postgresql: 5432,
  mongodb: 27017,
  sqlite: 0,
} as const

export function DatabaseConnectionForm() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
//   const {connectionDetails,setConnectionDetails} = useDatabaseStore();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  })

  async function onSubmit(data: FormData) {
    try {
      setIsConnecting(true)
      const response = await fetch('/api/database/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) throw new Error(result.message || 'Connection failed')

      toast({
        title: 'Success',
        description: 'Database connected successfully',
      })

    //   setConnectionDetails({
    //     ...result.data.connectionDetails,
    //     tables: result.data.tables,
    //     username: data.username,
    //     password: data.password,
    //   });

      // Navigate to the database page with connection details
      const searchParams = new URLSearchParams({
        tables: JSON.stringify(result.data.tables),
        ...result.data.connectionDetails,
        username: data.username,
        password: data.password
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

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 border-primary/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Database Connection</CardTitle>
        <CardDescription>
          Enter your database credentials to establish a connection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Type</FormLabel>
                    <Select
                      onValueChange={(value: FormData['type']) => {
                        field.onChange(value)
                        form.setValue('port', PORT_MAP[value])
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select database type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host</FormLabel>
                      <FormControl>
                        <Input placeholder="localhost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            {...field} 
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="database"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <DatabaseIcon className="mr-2" />
                  Connect Database
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}