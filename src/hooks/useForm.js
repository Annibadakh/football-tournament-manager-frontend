import { useCallback, useState } from "react";
import { apiErrorsToFieldErrors, validateWithSchema } from "@/utils/form";

/**
 * Plain-state form helper (no form library): values, field errors and a submit wrapper.
 * onValid receives zod-parsed values and returns the request() result to map API field errors.
 */
const useForm = (initialValues, schema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  }, []);

  const handleSubmit = (onValid) => async (event) => {
    event?.preventDefault();
    const result = validateWithSchema(schema, values);
    setErrors(result.errors);
    if (!result.isValid) return;

    setIsSubmitting(true);
    const response = await onValid(result.data);
    setIsSubmitting(false);
    if (response && !response.ok && response.errors?.length)
      setErrors(apiErrorsToFieldErrors(response.errors));
  };

  return { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit };
};

export default useForm;
