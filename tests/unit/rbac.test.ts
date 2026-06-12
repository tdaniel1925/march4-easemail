import { describe, it, expect } from "vitest";
import { roleAtLeast, canActOnOrg, type AuthContext, type Role } from "@/lib/rbac";

const ctx = (role: Role, orgId = "orgA"): AuthContext => ({
  userId: "u1",
  email: "u1@x.com",
  orgId,
  role,
});

describe("rbac.roleAtLeast", () => {
  it("orders roles member < org_admin < super_admin", () => {
    expect(roleAtLeast("member", "member")).toBe(true);
    expect(roleAtLeast("member", "org_admin")).toBe(false);
    expect(roleAtLeast("org_admin", "org_admin")).toBe(true);
    expect(roleAtLeast("org_admin", "super_admin")).toBe(false);
    expect(roleAtLeast("super_admin", "org_admin")).toBe(true);
    expect(roleAtLeast("super_admin", "super_admin")).toBe(true);
  });
});

describe("rbac.canActOnOrg", () => {
  it("super_admin can act on any org", () => {
    expect(canActOnOrg(ctx("super_admin", "orgA"), "orgB")).toBe(true);
  });
  it("org_admin can act only on its own org", () => {
    expect(canActOnOrg(ctx("org_admin", "orgA"), "orgA")).toBe(true);
    expect(canActOnOrg(ctx("org_admin", "orgA"), "orgB")).toBe(false);
  });
  it("member can never act at org scope", () => {
    expect(canActOnOrg(ctx("member", "orgA"), "orgA")).toBe(false);
    expect(canActOnOrg(ctx("member", "orgA"), "orgB")).toBe(false);
  });
});
