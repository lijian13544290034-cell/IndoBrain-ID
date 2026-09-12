export function isAccountDatabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY));
}

export function accountServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
}

export function accountSessionCookieName() {
  return 'indobrain_account_session';
}

/** Never expose this value to a client, response body, audit entry, or log. */
export function initialStudentPassword() {
  const value = process.env.INITIAL_STUDENT_PASSWORD;
  if (!value) throw new Error('INITIAL_STUDENT_PASSWORD_NOT_CONFIGURED');
  return value;
}
