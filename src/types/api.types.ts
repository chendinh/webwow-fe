export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
}
