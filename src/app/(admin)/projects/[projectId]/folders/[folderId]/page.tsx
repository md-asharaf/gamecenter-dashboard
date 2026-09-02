import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/api/client'
import { createServerApi } from '@/lib/api/api-server'
import { QuestionsClient } from './questions-client'

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ projectId: string; folderId: string }>
}) {
  const resolvedParams = await params
  const { projectId, folderId } = resolvedParams
  const queryClient = getQueryClient()
  const api = await createServerApi()

  await queryClient.prefetchQuery({
    queryKey: ['questions', projectId, folderId, 0, 10, "", "createdAt", "desc"],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/folders/${folderId}/questions?page=0&limit=10&search=&sortBy=createdAt&sortDir=desc`)
      return res.data
    },
  })

  await queryClient.prefetchQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/folders/${folderId}`)
      return res.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuestionsClient projectId={projectId} folderId={folderId} />
    </HydrationBoundary>
  )
}
