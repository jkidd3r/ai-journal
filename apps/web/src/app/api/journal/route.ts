// apps/web/src/app/api/journal/route.ts

import { NextRequest } from 'next/server'
import { callAnthropic } from '../../utils/anthropic'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  console.log('[API RECEIVED PROMPT]', prompt)

  try {
    const result = await callAnthropic(prompt)
    console.log('[CLAUDE RESPONSE]', result)
    return Response.json({ result })
  } catch (error: any) {
    console.error('[API ERROR]', error)
    return new Response('Error calling Anthropic', { status: 500 })
  }
}