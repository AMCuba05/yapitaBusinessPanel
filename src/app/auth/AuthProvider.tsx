import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../lib/api';
import { firebaseAuth } from '../lib/firebase';
import { invalidateBusinessResourceCache } from '../lib/resourceCache';
import type { BusinessAssignment, BusinessSession } from '../types/api';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: BusinessSession | null;
  assignment: BusinessAssignment | null;
  loading: boolean;
  error: string | null;
  login(email: string, password: string): Promise<void>;
  activateInvitation(
    fullName: string,
    email: string,
    password: string,
  ): Promise<void>;
  logout(): Promise<void>;
  selectAssignment(id: string): void;
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ASSIGNMENT_KEY = 'yapita.admin.assignmentId';

function authMessage(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String(error.code)
      : '';
  if (code === 'auth/invalid-credential') return 'Correo o contraseña incorrectos.';
  if (code === 'auth/too-many-requests')
    return 'Demasiados intentos. Intenta nuevamente más tarde.';
  if (code === 'auth/operation-not-allowed')
    return 'Firebase Email/Password todavía no está habilitado.';
  if (code === 'auth/email-already-in-use')
    return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (code === 'auth/weak-password')
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (error instanceof Error) return error.message;
  return 'No fue posible iniciar sesión.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BusinessSession | null>(null);
  const [assignmentId, setAssignmentId] = useState(
    () => localStorage.getItem(ASSIGNMENT_KEY) ?? '',
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const link = useCallback(async (user: User) => {
    const linked = await apiRequest<BusinessSession>(
      user,
      '/auth/business/link',
      { method: 'POST' },
    );
    setProfile(linked);
    setAssignmentId((current) => {
      const exists = linked.assignments.some(({ id }) => id === current);
      const next = exists ? current : linked.assignments[0]?.id ?? '';
      if (next) localStorage.setItem(ASSIGNMENT_KEY, next);
      return next;
    });
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, async (user) => {
        setLoading(true);
        setFirebaseUser(user);
        setError(null);
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }
        try {
          await link(user);
        } catch (reason) {
          setProfile(null);
          setError(authMessage(reason));
        } finally {
          setLoading(false);
        }
      }),
    [link],
  );

  const assignment =
    profile?.assignments.find(({ id }) => id === assignmentId) ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      assignment,
      loading,
      error,
      async login(email, password) {
        setLoading(true);
        setError(null);
        try {
          await signInWithEmailAndPassword(
            firebaseAuth,
            email.trim(),
            password,
          );
        } catch (reason) {
          const message = authMessage(reason);
          setError(message);
          throw new Error(message);
        } finally {
          setLoading(false);
        }
      },
      async activateInvitation(fullName, email, password) {
        setLoading(true);
        setError(null);
        try {
          const credential = await createUserWithEmailAndPassword(
            firebaseAuth,
            email.trim().toLowerCase(),
            password,
          );
          await updateProfile(credential.user, { displayName: fullName.trim() });
          await sendEmailVerification(credential.user);
          await signOut(firebaseAuth);
        } catch (reason) {
          const message = authMessage(reason);
          setError(message);
          throw new Error(message);
        } finally {
          setLoading(false);
        }
      },
      async logout() {
        localStorage.removeItem(ASSIGNMENT_KEY);
        invalidateBusinessResourceCache();
        await signOut(firebaseAuth);
      },
      selectAssignment(id) {
        setAssignmentId(id);
        localStorage.setItem(ASSIGNMENT_KEY, id);
      },
      async request<T>(path: string, init?: RequestInit) {
        if (!firebaseUser) return Promise.reject(new Error('Sesión no disponible.'));
        const result = await apiRequest<T>(firebaseUser, path, init);
        const method = (init?.method ?? 'GET').toUpperCase();
        if (method !== 'GET' && method !== 'HEAD') {
          invalidateBusinessResourceCache(assignment?.id);
        }
        return result;
      },
    }),
    [assignment, error, firebaseUser, link, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return value;
}
