"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

/**
 * Form Components
 *
 * A collection of form components with built-in validation and error handling.
 * Uses React Hook Form and Zod for validation.
 */

interface BaseFormProps<T extends FieldValues = any>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** מופע הטופס מ-React Hook Form */
  form: UseFormReturn<T>;
  /** פונקציה שתופעל בעת שליחת הטופס */
  onSubmit: (values: T) => void | Promise<void>;
}

/**
 * קומפוננטת טופס ראשית
 */
function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: BaseFormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx("space-y-4", className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/**
 * קומפוננטת שדה טופס
 */
interface FormFieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** שם השדה */
  name: string;
  /** תווית השדה */
  label?: string;
  /** האם השדה נדרש */
  required?: boolean;
  /** תיאור השדה */
  description?: string;
}

const FormFieldGroup = React.forwardRef<HTMLDivElement, FormFieldGroupProps>(
  (
    { name, label, required, description, children, className, ...props },
    ref,
  ) => {
    const {
      formState: { errors },
    } = useFormContext();
    const error = errors[name];

    return (
      <div
        ref={ref}
        className={clsx("space-y-2", className)}
        {...props}
      >
        {label && (
          <label
            htmlFor={name}
            className="text-text-primary block text-sm font-medium"
          >
            {label}
            {required && (
              <span
                className="text-action-error mr-1"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}
        {children}
        {description && (
          <p className="text-text-secondary text-sm">{description}</p>
        )}
        {error?.message && (
          <p className="text-action-error text-sm">{error.message as string}</p>
        )}
      </div>
    );
  },
);

FormFieldGroup.displayName = "FormFieldGroup";

/**
 * קומפוננטת כפתור שליחה
 */
interface FormSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** האם הטופס בתהליך שליחה */
  loading?: boolean;
}

const FormSubmitButton = React.forwardRef<
  HTMLButtonElement,
  FormSubmitButtonProps
>(({ loading, children, className, disabled, ...props }, ref) => {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <button
      ref={ref}
      type="submit"
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2",
        "bg-brand-primary text-white transition-colors",
        "hover:bg-opacity-90 focus:outline-none focus:ring-2",
        "focus:ring-brand-primary focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled || isSubmitting || loading}
      {...props}
    >
      {(isSubmitting || loading) && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

FormSubmitButton.displayName = "FormSubmitButton";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  BaseForm,
  FormFieldGroup,
  FormSubmitButton,
};
export type { BaseFormProps, FormFieldGroupProps, FormSubmitButtonProps };

export type FormProps = React.ComponentProps<typeof Form>;
export type FormItemProps = React.ComponentProps<typeof FormItem>;
export type FormLabelProps = React.ComponentProps<typeof FormLabel>;
export type FormControlProps = React.ComponentProps<typeof FormControl>;
export type FormDescriptionProps = React.ComponentProps<typeof FormDescription>;
export type FormMessageProps = React.ComponentProps<typeof FormMessage>;
export type FormFieldProps = React.ComponentProps<typeof FormField>;
