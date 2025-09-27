export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = "이메일 또는 비밀번호를 확인해주세요.") {
    super(message, 401);
    this.name = "InvalidCredentialsError";
  }
}

export class ConflictError extends AuthError {
  constructor(message = "이미 존재하는 리소스입니다.") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class ServerError extends AuthError {
  constructor(message = "서버 내부 오류") {
    super(message, 500);
    this.name = "ServerError";
  }
}
