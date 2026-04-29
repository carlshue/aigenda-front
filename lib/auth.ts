const VALID_USERS = ["carlos", "maría"];

export function isValidUser(username: string): boolean {
  return VALID_USERS.includes(username.toLowerCase());
}

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("currentUser");
}

export function setCurrentUser(username: string): void {
  if (typeof window === "undefined") return;
  if (isValidUser(username)) {
    localStorage.setItem("currentUser", username.toLowerCase());
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("currentUser");
}
