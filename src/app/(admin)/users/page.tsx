import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/react-query/get-query-client'
import { createServerApi } from '@/lib/api/api-server'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  const queryClient = getQueryClient()
  const api = await createServerApi()

  await queryClient.prefetchQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await api.get('/admins')
      return res.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersClient />
    </HydrationBoundary>
  )
}
