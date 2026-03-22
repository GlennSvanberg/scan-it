import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

type DbCtx = QueryCtx | MutationCtx;

async function getSessionByPublicId(ctx: DbCtx, publicId: string) {
  return await ctx.db
    .query("sessions")
    .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
    .unique();
}

export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    const publicId = randomHex(16);
    const deskToken = randomHex(32);
    await ctx.db.insert("sessions", {
      publicId,
      deskToken,
      deviceId: undefined,
      status: "active",
      createdAt: Date.now(),
    });
    return { publicId, deskToken };
  },
});

export const claimPhone = mutation({
  args: {
    publicId: v.string(),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await getSessionByPublicId(ctx, args.publicId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.status === "ended") {
      throw new Error("Session has ended");
    }
    if (session.deviceId !== undefined && session.deviceId !== args.deviceId) {
      throw new Error("This session is already paired to another phone");
    }
    if (session.deviceId === undefined) {
      await ctx.db.patch("sessions", session._id, {
        deviceId: args.deviceId,
      });
    }
    return { ok: true as const };
  },
});

export const submitScan = mutation({
  args: {
    publicId: v.string(),
    deviceId: v.string(),
    value: v.string(),
    format: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await getSessionByPublicId(ctx, args.publicId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.status === "ended") {
      throw new Error("Session has ended");
    }
    if (session.deviceId === undefined || session.deviceId !== args.deviceId) {
      throw new Error("Not authorized for this session");
    }
    const createdAt = Date.now();
    await ctx.db.insert("scans", {
      sessionId: session._id,
      value: args.value,
      format: args.format,
      createdAt,
    });
    return { createdAt };
  },
});

export const endSession = mutation({
  args: {
    publicId: v.string(),
    deskToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await getSessionByPublicId(ctx, args.publicId);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.deskToken !== args.deskToken) {
      throw new Error("Invalid desk token");
    }
    if (session.status === "ended") {
      return { ok: true as const };
    }
    await ctx.db.patch("sessions", session._id, { status: "ended" });
    return { ok: true as const };
  },
});

export const getDeskView = query({
  args: {
    publicId: v.string(),
    deskToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await getSessionByPublicId(ctx, args.publicId);
    if (!session || session.deskToken !== args.deskToken) {
      return null;
    }
    const scans = await ctx.db
      .query("scans")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    scans.sort((a, b) => a.createdAt - b.createdAt);
    return {
      status: session.status,
      devicePaired: session.deviceId !== undefined,
      scans: scans.map((s) => ({
        _id: s._id,
        value: s.value,
        format: s.format,
        createdAt: s.createdAt,
      })),
    };
  },
});

export const getPhoneSession = query({
  args: {
    publicId: v.string(),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await getSessionByPublicId(ctx, args.publicId);
    if (!session) {
      return { exists: false as const };
    }
    const paired = session.deviceId !== undefined;
    const isThisDevice = paired && session.deviceId === args.deviceId;
    const canClaim = !paired && session.status === "active";
    return {
      exists: true as const,
      status: session.status,
      paired,
      isThisDevice,
      canClaim,
    };
  },
});
