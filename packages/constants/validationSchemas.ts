import * as yup from "yup";

export const customYupValidation = {
  amount: yup
    .number()
    .typeError("Value must be a number")
    .positive("Must be a positive number")
    .min(1, "Minimum payment amount is GHS 1.00")
    .required("Amount is required"),
  simpleRequiredString: yup.string().trim().required("Name is required"),
  name: yup
    .string()
    .trim()
    .matches(/^\D*$/, "Name should not contain numbers")
    .matches(/\b\w+\b(\s+\w+)+\b/g, "Surname is required")
    .required("Name is required"),
  unRequiredName: yup
    .string()
    .trim()
    .matches(/^\D*$/, "Name should not contain numbers")
    .matches(/\b\w+\b(\s+\w+)+\b/g, "Surname is required")
    .notRequired(),
  ghanaCardId: yup
    .string()
    .trim()
    .matches(/^[A-Z]{3}-\d{9}-\d$/, "Invalid code format, GHA-123456789-1")
    .required("Ghana Card is required"),
  phoneNumber: yup
    .string()
    .trim()
    .matches(/^0\d{9}$/, "Phone Number is incorrect")
    .required("Phone number is required"),
  nhisId: yup.string().trim().notRequired(),
  gender: yup.string().trim().required("Gender is required"),
  dateOfBirth: yup
    .date()
    .max(new Date(), "Date must not be after than today")
    .required("Date of Birth is required"),
  cvv: yup
    .string()
    .trim()
    .matches(/^\d{3}$/, "CVV must be 3 digits")
    .required("CVV is required"),
  expiryDate: yup
    .string()
    .trim()
    .required("Expiry date is required")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date"),
  expiryMonth: yup
    .string()
    .trim()
    .matches(/^(0[1-9]|1[0-2])$/, "Invalid month")
    .required("Expiry month is required"),
  expiryYear: yup
    .string()
    .trim()
    .matches(/^\d{2}$/, "Invalid year")
    .required("Expiry year is required"),
  cardHolderName: yup
    .string()
    .trim()
    .matches(/^\D*$/, "Name should not contain numbers")
    .matches(/\b\w+\b(\s+\w+)+\b/g, "Surname is required")
    .required("Name is required"),
  cardNumber: yup
    .string()
    .trim()
    .matches(/^\d{16}$/, "Card number is invalid")
    .required("Card number is required"),
};
