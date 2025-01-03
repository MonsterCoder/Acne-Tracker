import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  console.log('API route: Received POST request')
  try {
    const formData = await request.formData()
    console.log('API route: Parsed form data')

    const image = formData.get('image') as File | null

    if (!image) {
      console.log('API route: No image provided')
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    console.log('API route: Image received, size:', image.size, 'bytes')

    const buffer = Buffer.from(await image.arrayBuffer())
    const tempFilePath = path.join('/tmp', `${Date.now()}.jpg`)
    fs.writeFileSync(tempFilePath, buffer)
    console.log('API route: Image saved to', tempFilePath)

    return new Promise((resolve) => {
      console.log('API route: Spawning Python process')
      const pythonProcess = spawn('python', ['analyze_face.py', tempFilePath])

      let result = ''
      let error = ''

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString()
        console.log('Python stdout:', data.toString())
      })

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
        console.error('Python stderr:', data.toString())
      })

      pythonProcess.on('close', (code) => {
        console.log('API route: Python process closed with code', code)
        fs.unlinkSync(tempFilePath)

        if (code !== 0) {
          console.error('Error analyzing image:', error)
          resolve(NextResponse.json({ error: `Error analyzing image: ${error}` }, { status: 500 }))
        } else {
          try {
            const analysisResult = JSON.parse(result)
            console.log('API route: Analysis result:', analysisResult)
            resolve(NextResponse.json(analysisResult))
          } catch (e) {
            console.error('Error parsing analysis result:', e)
            resolve(NextResponse.json({ error: 'Error parsing analysis result' }, { status: 500 }))
          }
        }
      })
    })
  } catch (error) {
    console.error('Unexpected error in API route:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

