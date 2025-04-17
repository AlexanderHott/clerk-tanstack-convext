import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAuth } from '@clerk/tanstack-react-start/server'
import { getWebRequest } from '@tanstack/react-start/server'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { SignOutButton } from '@clerk/tanstack-react-start'
import { useMutation } from '@tanstack/react-query'

const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  if (!request) throw new Error('No request found')
  const { userId } = await getAuth(request)

  if (!userId) {
    throw redirect({
      to: '/sign-in/$',
    })
  }

  return { userId }
})

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
})

function Home() {
  const state = Route.useLoaderData()
  const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}))
  // const setCompleted = useMutation(api.tasks.setTaskCompleted)
  const {
    mutate: setCompleted,
    variables,
    isPending,
  } = useMutation({
    mutationFn: useConvexMutation(api.tasks.setTaskCompleted),
  })

  return (
    <div>
      <SignOutButton />
      <h1>Welcome! Your ID is {state.userId}!</h1>
      {data.map(({ _id, text }) => (
        <div
          key={_id}
          // style={{
          //   opacity: isPending && variables.taskId === _id ? '50%' : '100%',
          // }}
        >
          <input
            disabled={isPending && variables.taskId === _id}
            type="checkbox"
            id={`checkbox-${_id}`}
            onChange={(e) =>
              setCompleted({ taskId: _id, isCompleted: e.target.checked })
            }
          />
          <label htmlFor={`checkbox-${_id}`}>{text}</label>
        </div>
      ))}
    </div>
  )
}
