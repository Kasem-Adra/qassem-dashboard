import { AIStreamingPanel } from '@/components/os/ai-streaming-panel'
import { WorkspaceShell } from '@/components/os/workspace-shell'

export default function WorkspacePage() {
  return (
    <WorkspaceShell>
      <AIStreamingPanel />
    </WorkspaceShell>
  )
}
