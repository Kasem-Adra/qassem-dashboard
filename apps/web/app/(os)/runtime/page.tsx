import { RuntimePlatformDashboard } from '@/components/os/runtime-platform-dashboard'
import { WorkspaceShell } from '@/components/os/workspace-shell'

export default function RuntimePage() {
  return (
    <WorkspaceShell>
      <RuntimePlatformDashboard />
    </WorkspaceShell>
  )
}
