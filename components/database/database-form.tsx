import { Input } from '@/components/ui/input'
import type { InputHTMLAttributes } from 'react'

interface DatabaseFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
}

export function DatabaseFormInput({
    label,
    error,
    className = '',
    ...props
}: DatabaseFormInputProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <Input
                {...props}
                className={`${error ? 'border-red-500' : ''} ${className} bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200`}
            />
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}