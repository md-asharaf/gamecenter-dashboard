import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/api/client'
import { createServerApi } from '@/lib/api/api-server'
import { FoldersClient } from './folders-client'

export default async function FoldersPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.projectId
  const queryClient = getQueryClient()
  const api = await createServerApi()

  await queryClient.prefetchQuery({
    queryKey: ['folders', projectId, 0, 10, "", "createdAt", "desc"],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/folders?page=0&limit=10&search=&sortBy=createdAt&sortDir=desc`)
      return res.data
    },
  })

  await queryClient.prefetchQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`)
      return res.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FoldersClient projectId={projectId} />
    </HydrationBoundary>
  )
}
