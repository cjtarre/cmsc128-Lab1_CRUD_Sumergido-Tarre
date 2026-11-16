import { useRef, useState } from "react";

import { validateTask } from "../../../shared/utils/validation";

// Shared field behavior; Add and Edit retain separate initialization and submission.
export function useTaskFormFields(initialValues, collaborative) {
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef(null);

    const handleChange = ({ target: { name, value } }) => {
        setFormData((previous) => ({
            ...previous,
            [name]: value,
            ...(collaborative && name === "dueDate" && !value ? { dueTime: "" } : {}),
        }));
        if (value.trim?.()) setErrors((previous) => ({ ...previous, [name]: "" }));
    };

    const handleTagToggle = (tagId) => {
        setFormData((previous) => ({
            ...previous,
            tags: previous.tags.includes(tagId)
                ? previous.tags.filter((id) => id !== tagId)
                : [...previous.tags, tagId],
        }));
    };

    const validateAndFocus = () => {
        const validationErrors = validateTask(formData, { deadlineRequired: !collaborative });
        if (!Object.keys(validationErrors).length) return true;

        setErrors(validationErrors);
        const firstField = Object.keys(validationErrors)[0];
        formRef.current?.elements.namedItem(firstField)?.focus();
        return false;
    };

    return {
        formData, setFormData, errors, setErrors, submitting, setSubmitting,
        formRef, handleChange, handleTagToggle, validateAndFocus,
    };
}
