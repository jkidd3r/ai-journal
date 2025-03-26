// apps/web/src/app/[[...slug]]/route.ts
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const path = params.slug?.join('/') || ''
  const targetURL = `https://kind-use-207794.framer.app/${path}`

  const res = await fetch(targetURL, {
    headers: {
      'user-agent': req.headers.get('user-agent') || '',
    },
  })

  const body = await res.text()

  return new Response(body, {
    status: res.status,
    headers: {
      'content-type': 'text/html',
    },
  })
}