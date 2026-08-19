import axios from 'axios';

interface LoginResponse {
  token: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<void> {
    try {
      const response = await axios.post<LoginResponse>('/api/login', { username, password });
      this.token = response.data.token;
      this.storeToken(this.token);
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  public getToken(): string | null {
    return this.token;
  }

  public logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

export default AuthService.getInstance();