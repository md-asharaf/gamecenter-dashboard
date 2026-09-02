import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/api/client'
import { createServerApi } from '@/lib/api/api-server'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  const queryClient = getQueryClient()
  const api = await createServerApi()

  await queryClient.prefetchQuery({
    queryKey: ['admins', 0, 10, "", "createdAt", "desc"],
    queryFn: async () => {
      const res = await api.get('/admins?page=0&limit=10&search=&sortBy=createdAt&sortDir=desc')
      return res.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersClient />
    </HydrationBoundary>
  )
}
