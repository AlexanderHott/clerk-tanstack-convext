import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').collect()
  },
})

export const setTaskCompleted = mutation({
  args: { taskId: v.id('tasks'), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.taskId, { isCompleted: args.isCompleted })
  },
})
