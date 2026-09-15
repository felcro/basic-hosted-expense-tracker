import { useQueryClient } from '@tanstack/react-query'
import { fetch } from 'expo/fetch'
import { useEffect } from 'react'

import {
  apiUrl,
  authHeaders,
  getAllExpensesQueryOptions,
  getTotalSpentQueryOptions,
} from './api'

const url = `${apiUrl}/api/expenses/stream`

export function useExpenseStream(isAuthenticated: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let cancelled = false
    let controller: AbortController | null = null
    const invalidate = () => {
      queryClient.invalidateQueries(getAllExpensesQueryOptions)
      queryClient.invalidateQueries(getTotalSpentQueryOptions)
    }

    const readStream = async (body: ReadableStream<Uint8Array>) => {
      const reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!cancelled) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })

        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''

        for (const frame of frames) {
          const eventName = frame
            .split('\n')
            .find((line) => line.startsWith('event:'))
            ?.slice('event:'.length)
            .trim()

          if (eventName === 'expenses') {
            invalidate()
          }
        }
      }
    }

    const connect = async () => {
      while (!cancelled) {
        try {
          controller = new AbortController()
          const res = await fetch(url, {
            headers: {
              ...(await authHeaders()),
              Accept: 'text/event-stream',
            },
            signal: controller.signal,
          })
          if (res.ok && res.body) {
            invalidate()
            await readStream(res.body)
          }
        } catch {
          // Do nothing, fall through to backoff and retry.
        }
        if (cancelled) {
          return
        }
        await new Promise((r) => setTimeout(r, 3000))
      }
    }

    void connect()

    return () => {
      cancelled = true
      controller?.abort()
    }
  }, [isAuthenticated, queryClient])
}
