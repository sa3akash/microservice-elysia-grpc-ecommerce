export class MyError extends Error {
  constructor(public override message: string, public code: number = 500) {
    super(message);
  }

  toResponse() {
    return Response.json(
      {
        error: this.message,
        code: "MyError",
      },
      {
        status: this.code,
      }
    );
  }
}
