import { Input } from '@/components/ui/input'
import type { InputHTMLAttributes } from 'react'

interface DatabaseFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    icon?: React.ComponentType<any>
}

export const DatabaseFormInput = ({ 
    label, 
    error,
    icon: Icon,
    ...props 
}: DatabaseFormInputProps) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground">
                    <Icon className="h-5 w-5" />
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

