import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export async function parseFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase()

  try {
    switch (fileType) {
      case 'pdf':
        return await parsePDF(file)
      case 'xlsx':
      case 'xls':
        return await parseExcel(file)
      case 'csv':
        return await parseCSV(file)
      case 'docx':
        return await parseDocx(file)
      default:
        throw new Error('Unsupported file type')
    }
  } catch (error) {
    console.error('File parsing error:', error)
    throw new Error('Failed to parse file')
  }
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    return 'PDF parsing requires pdf-parse package. Please provide text content directly.'
  }
}

async function parseExcel(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  let content = ''
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName]
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    content += `\n\n=== ${sheetName} ===\n\n`
    content += sheetData.map((row: any) => row.join(' | ')).join('\n')
  })

  return content.trim()
}

async function parseCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const content = results.data
          .map((row: any) => row.join(' | '))
          .join('\n')
        resolve(content)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}
