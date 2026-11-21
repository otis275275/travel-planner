export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  agreeTerms?: boolean;
}

export interface AuthErrorState {
  message: string | null;
  fieldErrors?: Record<string, string>;
}
