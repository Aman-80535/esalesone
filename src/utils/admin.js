export function getAdminEmails() {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@shopi.com,admin@esalesone.com,as6600422@gmail.com';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email, userData = null) {
  if (userData && (userData.role === 'admin' || userData.isAdmin === true)) {
    return true;
  }
  if (!email) return false;
  const admins = getAdminEmails();
  if (!admins.length) return false;
  return admins.includes(email.toLowerCase());
}
