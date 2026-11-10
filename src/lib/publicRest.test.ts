import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPublicRows } from "./publicRest";

describe("fetchPublicRows", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends public REST filters, ordering, and limits", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 1 }]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchPublicRows<{ id: number }>("homepage_about", {
        select: "id,profile_image_url",
        filters: { published: true },
        order: [{ column: "sort_order" }],
        limit: 1,
      }),
    ).resolves.toEqual([{ id: 1 }]);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    const url = new URL(String(requestUrl));
    expect(url.pathname).toBe("/rest/v1/homepage_about");
    expect(url.searchParams.get("select")).toBe("id,profile_image_url");
    expect(url.searchParams.get("published")).toBe("eq.true");
    expect(url.searchParams.get("order")).toBe("sort_order.asc");
    expect(url.searchParams.get("limit")).toBe("1");
    expect((requestInit as RequestInit).headers).toHaveProperty("apikey");
  });

  it("surfaces public REST response errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("permission denied", { status: 403 })),
    );

    await expect(fetchPublicRows("restricted_table")).rejects.toThrow(
      "Public restricted_table request failed (403): permission denied",
    );
  });
});
