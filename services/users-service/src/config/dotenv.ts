class Dotenv {
  public PORT: string = process.env["PORT"] || "50051";
  public DATABASE_URL: string = process.env["DATABASE_URL"] || ""

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