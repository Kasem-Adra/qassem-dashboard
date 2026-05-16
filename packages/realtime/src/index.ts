export type PresenceStatus = 'online' | 'idle' | 'offline'

export interface PresenceUser {
  id: string
  name: string
  color: string
  status: PresenceStatus
  cursor?: { x: number; y: number }
}

export interface RealtimeEvent<T = unknown> {
  id: string
  roomId: string
  type: 'presence.join' | 'presence.leave' | 'cursor.move' | 'document.patch' | 'ai.token' | 'notification'
  payload: T
  createdAt: string
}

export function createRealtimeEvent<T>(roomId: string, type: RealtimeEvent<T>['type'], payload: T): RealtimeEvent<T> {
  return {
    id: crypto.randomUUID(),
    roomId,
    type,
    payload,
    createdAt: new Date().toISOString()
  }
}

export class CollaborationRoomState {
  users = new Map<string, PresenceUser>()
  events: RealtimeEvent[] = []

  join(user: PresenceUser) {
    this.users.set(user.id, user)
    return createRealtimeEvent('workspace', 'presence.join', user)
  }

  leave(userId: string) {
    const user = this.users.get(userId)
    this.users.delete(userId)
    return createRealtimeEvent('workspace', 'presence.leave', { userId, name: user?.name })
  }

  snapshot() {
    return {
      users: Array.from(this.users.values()),
      events: this.events.slice(-50)
    }
  }
}
