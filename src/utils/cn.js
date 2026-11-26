// Joins class names, skipping falsy values from conditionals
export const cn = (...classes) => classes.filter(Boolean).join(" ");
