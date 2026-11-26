// Turns zod issues into { fieldName: message }, keeping the first message per field
export const zodIssuesToFieldErrors = (issues = []) =>
  issues.reduce((fieldErrors, issue) => {
    const field = issue.path.join(".") || "root";
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    return fieldErrors;
  }, {});

// Backend validation errors arrive as [{ field, message }]
export const apiErrorsToFieldErrors = (errors = []) =>
  errors.reduce((fieldErrors, { field, message }) => {
    if (!fieldErrors[field]) fieldErrors[field] = message;
    return fieldErrors;
  }, {});

export const validateWithSchema = (schema, values) => {
  const result = schema.safeParse(values);
  if (result.success) return { isValid: true, data: result.data, errors: {} };
  return { isValid: false, data: null, errors: zodIssuesToFieldErrors(result.error.issues) };
};
