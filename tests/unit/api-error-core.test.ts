import { ApiError } from "@/services/http/types";

describe("ApiError core", () => {
  it("sets defaults and inherited Error properties", () => {
    const err = new ApiError({ message: "Oops", status: 500 });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("Oops");
    expect(err.status).toBe(500);
    expect(err.code).toBe("UNKNOWN");
    expect(err.requestId).toBe("");
  });

  it("matches error code with is helper", () => {
    const err = new ApiError({ message: "no", code: "ERR_FORBIDDEN", status: 403 });
    expect(err.is("ERR_FORBIDDEN")).toBe(true);
    expect(err.is("ERR_OTHER")).toBe(false);
  });
});
