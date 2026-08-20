import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/react-query/get-query-client'
import { createServerApi } from '@/lib/api/api-server'
import { QuestionsClient } from './questions-client'
import { Project } from '@/lib/types/project'

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
    queryKey: ['questions', projectId, folderId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/folders/${folderId}/questions`)
      return res.data
    },
  })

  const projectRes = await api.get(`/projects`).catch(() => null)
  const projectList = projectRes?.data?.data?.items || []
  const project = projectList.find((p: Project) => p.id === projectId) || null

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuestionsClient projectId={projectId} folderId={folderId} project={project} />
    </HydrationBoundary>
  )
}
