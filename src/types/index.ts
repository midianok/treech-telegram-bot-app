export interface User {
  name: string
  count: number
}

export interface AiAgent {
  id: string
  name: string
  prompt: string
  color?: string
}

export interface ImagePrompt {
  id: string
  name: string
  keywords: string
  prompt: string
}

export interface OperationCall {
  operationName: string | null
  calledAt: string
  userId: number
  userName: string | null
}
