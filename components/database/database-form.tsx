import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface DatabaseFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    success?: boolean;
    helperText?: string;
    icon?: React.ComponentType<any>;
    optional?: boolean;
}

export const DatabaseFormInput = ({ 
    label, 
    error,
    success,
    helperText,
    icon: Icon,
    optional,
    className,
    disabled,
    ...props 
}: DatabaseFormInputProps) => {
    const inputWrapperStyles = cn(
        "relative group",
        disabled && "opacity-60"
    );

    const iconWrapperStyles = cn(
        "absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200",
        error ? "text-red-500" : "text-muted-foreground",
        "group-focus-within:text-primary"
    );

    const inputStyles = cn(
        "h-12 bg-background/50 backdrop-blur-sm",
        "border border-input/50 hover:border-input",
        "focus:border-primary focus:ring-1 focus:ring-primary",
        "transition-all duration-200",
        Icon && "pl-11",
        error && "border-red-500 hover:border-red-600 focus:border-red-500 focus:ring-red-500",
        success && "border-green-500 hover:border-green-600 focus:border-green-500 focus:ring-green-500",
        "[&>*]:text-lg [&_input]:text-lg", // This ensures the input text itself is large
        className
    );

    const labelStyles = cn(
        "flex items-center gap-2 text-base font-medium mb-2",
        error && "text-red-500",
        disabled && "opacity-60"
    );

    const helperTextStyles = cn(
        "text-sm mt-2",
        error ? "text-red-500" : "text-muted-foreground"
    );

    return (
        <div className="space-y-2">
            <div className={labelStyles}>
                <span>{label}</span>
                {optional && (
                    <span className="text-sm text-muted-foreground font-normal">
                        (Optional)
                    </span>
                )}
            </div>
            
            <div className={inputWrapperStyles}>
                {Icon && (
                    <div className={iconWrapperStyles}>
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                
                <Input 
                    {...props}
                    disabled={disabled}
                    className={inputStyles}
                    style={{ fontSize: '1.08rem' }} // Additional backup using inline style
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={
                        error ? `${props.id}-error` : 
                        helperText ? `${props.id}-helper` : undefined
                    }
                />

                {(error || success) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {error && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {success && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p 
                    className={helperTextStyles}
                    id={error ? `${props.id}-error` : `${props.id}-helper`}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};