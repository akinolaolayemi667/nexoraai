import { useState, type ChangeEvent, type FormEvent } from "react";

type Errors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, string>>(initialValues: T, validate: (values: T) => Errors<T>) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors<T>>({});

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  function errorFor(name: keyof T) {
    return serverErrors[name] ?? (touched[name] || submitted ? errors[name] : undefined);
  }

  function isValidField(name: keyof T) {
    return Boolean(touched[name] && values[name] && !errors[name] && !serverErrors[name]);
  }

  function setValue(name: keyof T, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setServerErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }

  function register(name: keyof T & string) {
    return {
      name,
      value: values[name],
      onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(name, event.target.value),
      onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
      error: errorFor(name),
    };
  }

  function handleSubmit(onValid: (values: T) => void) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      const firstInvalid = Object.keys(initialValues).find((key) => errors[key as keyof T]);
      if (firstInvalid) {
        const field = event.currentTarget.elements.namedItem(firstInvalid);
        if (field instanceof HTMLElement) field.focus();
        return;
      }
      onValid(values);
    };
  }

  return {
    values,
    setValue,
    setValues,
    register,
    errorFor,
    isValidField,
    isValid,
    setServerError: (name: keyof T, message: string) => setServerErrors((current) => ({ ...current, [name]: message })),
    handleSubmit,
  };
}
