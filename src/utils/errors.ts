interface ErrorResponseLike {
  message?: unknown;
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const response = error as ErrorResponseLike;
    if (typeof response.message === 'string' && response.message.trim()) {
      return response.message;
    }
  }

  return fallback;
};
