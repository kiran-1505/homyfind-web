import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

/**
 * Create an invisible reCAPTCHA verifier on a DOM element.
 * Must be called once before sendOTP.
 */
export function createRecaptchaVerifier(elementId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  return new RecaptchaVerifier(auth, elementId, { size: 'invisible' });
}

/**
 * Send OTP to an Indian phone number.
 * Accepts 10-digit number (prepends +91 automatically).
 */
export async function sendOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  const fullPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
  return signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier);
}

/**
 * Verify the 6-digit OTP code from SMS.
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

/**
 * Sign out the current user.
 */
export async function logOut(): Promise<void> {
  const auth = getFirebaseAuth();
  return signOut(auth);
}

/**
 * Subscribe to auth state changes. Returns unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current authenticated user (synchronous).
 */
export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth.currentUser;
}

/**
 * Sign up a new user with email and password.
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Normalize Firebase phone number to 10-digit Indian format.
 * +919876543210 → 9876543210
 */
export function normalizePhone(firebasePhone: string): string {
  return firebasePhone.replace(/^\+91/, '');
}
