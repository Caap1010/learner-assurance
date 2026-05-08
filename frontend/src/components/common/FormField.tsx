import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
    label: string;
    placeholder?: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
}

export function FormField({ label, placeholder, registration, error }: FormFieldProps) {
    return (
        <label className="form-field">
            <span>{label}</span>
            <input placeholder={placeholder} {...registration} />
            {error ? <small className="error-text">{error.message}</small> : null}
        </label>
    );
}
