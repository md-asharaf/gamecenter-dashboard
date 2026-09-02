import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/api/client'
import { createServerApi } from '@/lib/api/api-server'
import { ProjectsClient } from './projects-client'

export default async function ProjectsPage() {
  const queryClient = getQueryClient()
  const api = await createServerApi()

  await queryClient.prefetchQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects')
      return res.data.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsClient />
    </HydrationBoundary>
  )
}
