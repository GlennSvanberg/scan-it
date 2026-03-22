import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    publicId: v.string(),
    deskToken: v.string(),
    deviceId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("ended")),
    createdAt: v.number(),
  }).index("by_publicId", ["publicId"]),

  scans: defineTable({
    sessionId: v.id("sessions"),
    value: v.string(),
    format: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
