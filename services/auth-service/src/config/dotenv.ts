class Dotenv {
  public PORT: string = process.env["PORT"] || "50050";
  public AUTH_DATABASE_URL: string = process.env["AUTH_DATABASE_URL"] || "";

  public JWT_SECRET: string = process.env["JWT_SECRET"] || "secretjwt";
  public JWT_SECRET_REFRESH: string = process.env["JWT_SECRET_REFRESH"] || "secretjwtrefresh";
  public INTERNAL_GATEWAY_VALUE: string = process.env["INTERNAL_GATEWAY_VALUE"] || "gateway";

  public static load() {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined || value === null) {
        console.error(`${key} env is not defined.`, { service: "config" });
        process.exit(1);
      }
    }
  }
}

export const config: Dotenv = new Dotenv();