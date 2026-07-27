export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bannerUrl?: string;
  role?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  loginWithGoogle: (callbackURL?: string) => Promise<void>;
  loginWithGithub: (callbackURL?: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "name" | "email" | "bio" | "role" | "image" | "bannerUrl" | "linkedinUrl" | "githubUrl" | "portfolioUrl">>) => Promise<void>;
  uploadBanner: (bannerDataUrl: string) => Promise<void>;
  removeBanner: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
