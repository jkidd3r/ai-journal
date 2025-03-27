import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    // For now, we'll just echo back the prompt
    // Later we can integrate with an AI service
    const response = `Here's a reflection on your entry: "${prompt}"`

    return NextResponse.json({ result: response })
  } catch (error) {
    console.error('Error processing journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to process journal entry' },
      { status: 500 }
    )
  }
} 