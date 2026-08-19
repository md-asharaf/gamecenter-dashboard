import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/react-query/get-query-client'
import { createServerApi } from '@/lib/api/api-server'
import { QuestionsClient } from './questions-client'

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.projectId
  const queryClient = getQueryClient()
  const api = await createServerApi()

  await queryClient.prefetchQuery({
    queryKey: ['questions', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/questions`)
      return res.data
    },
  })

  const projectRes = await api.get(`/projects`).catch(() => null)
  const projectList = projectRes?.data?.data?.items || []
  const project = projectList.find((p: any) => p.id === projectId) || null

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuestionsClient projectId={projectId} project={project} />
    </HydrationBoundary>
  )
}
