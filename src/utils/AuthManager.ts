/**
 * User interface
 */
export interface User {
    username: string;
    password?: string; // In a real app, this would be hashed. For hackathon MVP, plain text is acceptable per plan.
    highScore?: number;
}

/**
 * Singleton class to manage user authentication and session
 */
export class AuthManager {
    private static instance: AuthManager;
    private currentUser: User | null = null;
    private readonly STORAGE_KEY_USERS = "hacknation_users";
    private readonly STORAGE_KEY_SESSION = "hacknation_session";

    private constructor() {
        this.loadSession();
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    /**
     * Register a new user
     */
    public register(username: string, password: string): { success: boolean; message: string } {
        if (!username || !password) {
            return { success: false, message: "Username and password required." };
        }

        const users = this.getUsers();

        if (users[username]) {
            return { success: false, message: "Username already exists." };
        }

        users[username] = { username, password, highScore: 0 };
        this.saveUsers(users);

        return { success: true, message: "Registration successful!" };
    }

    /**
     * Login a user
     */
    public login(username: string, password: string): { success: boolean; message: string } {
        const users = this.getUsers();
        const user = users[username];

        if (!user || user.password !== password) {
            return { success: false, message: "Invalid username or password." };
        }

        this.currentUser = { ...user };
        delete this.currentUser.password; // Don't keep password in memory object if not needed

        this.saveSession();
        return { success: true, message: "Login successful!" };
    }

    /**
     * Logout current user
     */
    public logout(): void {
        this.currentUser = null;
        localStorage.removeItem(this.STORAGE_KEY_SESSION);
    }

    /**
     * Get current logged in user
     */
    public getCurrentUser(): User | null {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     */
    public isLoggedIn(): boolean {
        return this.currentUser !== null;
    }

    // --- Helpers ---

    private getUsers(): Record<string, User> {
        const data = localStorage.getItem(this.STORAGE_KEY_USERS);
        return data ? JSON.parse(data) : {};
    }

    private saveUsers(users: Record<string, User>): void {
        localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
    }

    private loadSession(): void {
        const data = localStorage.getItem(this.STORAGE_KEY_SESSION);
        if (data) {
            this.currentUser = JSON.parse(data);
        }
    }

    private saveSession(): void {
        if (this.currentUser) {
            localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
        }
    }
}
