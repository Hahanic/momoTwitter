export interface Conversation {
  _id: string
  isGroup: boolean
  lastMessageSnippet: string
  lastMessageAt: string
  unreadCount: number
  isSticky: boolean
  isMuted: boolean
  displayName: string
  displayAvatar: string
  peerId: string
}

export interface ChatMessage {
  _id: string
  conversationId: string
  senderId: {
    _id: string
    displayName: string
    username: string
    avatarUrl: string
  }
  content: string
  media: Array<{ type: string; url: string }>
  createdAt: string
  updatedAt: string
}

export interface CreatePrivateChatPayload {
  isGroup: false
  recipientId: string
}

export interface CreateGroupChatPayload {
  isGroup: true
  groupName: string
  groupAvatar?: string
  participantIds: Array<{ userId: string }>
}

export interface SendMessagePayload {
  content?: string
  media?: Array<{ type: string; url: string }>
}
