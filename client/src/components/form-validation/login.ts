import * as Yup from "yup";

const emailRequired = "Email required";
const passwordRequired = "Passwored required";
const emailLength = "Email must be at least 3 characters";
const passwordLength = "Password must be at least 3 characters";
const invalidEmail = "Email must be a valid Email";

export const LoginValidation = Yup.object().shape({
  email: Yup.string()
    .min(3, emailLength)
    .max(255)
    .email(invalidEmail)
    .required(emailRequired),
  password: Yup.string()
    .min(3, passwordLength)
    .max(255)
    .required(passwordRequired)
});

export const RegisterValidation = Yup.object().shape({
  email: Yup.string()
    .min(3, emailLength)
    .max(255)
    .email(invalidEmail)
    .required(emailRequired),
  password: Yup.string()
    .min(3, passwordLength)
    .max(255)
    .required(passwordRequired),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Password Fields must match")
    .required("Confirm Password is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Required")
});
