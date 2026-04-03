import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const DEFAULT_CHUNK_SIZE = 500; // characters
const DEFAULT_CHUNK_OVERLAP = 50; // characters

export interface Chunk {
  content: string;
  chunkIndex: number;
  metadata: {
    page?: number;
    lineStart?: number;
    lineEnd?: number;
  };
}

export interface ParsedDocument {
  text: string;
  metadata: {
    pages?: number;
    paragraphs?: number;
  };
}

interface ProcessOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(
  buffer: Buffer,
): Promise<ParsedDocument> {
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  return {
    text: textResult.text,
    metadata: {
      pages: textResult.total,
    },
  };
}

/**
 * Extract text from DOCX buffer
 */
export async function extractTextFromDOCX(
  buffer: Buffer,
): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    metadata: {
      paragraphs: result.messages.length,
    },
  };
}

/**
 * Extract text based on file type
 */
export async function extractText(
  buffer: Buffer,
  fileType: string,
): Promise<ParsedDocument> {
  switch (fileType) {
    case "pdf":
      return extractTextFromPDF(buffer);
    case "docx":
    case "doc":
      return extractTextFromDOCX(buffer);
    case "txt":
      return {
        text: buffer.toString("utf-8"),
        metadata: {},
      };
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(text: string, options: ProcessOptions = {}): Chunk[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

  const chunks: Chunk[] = [];
  const lines = text.split("\n");

  let currentChunk = "";
  let currentLineStart = 0;
  let chunkIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // If adding this line exceeds chunk size, save current chunk and start new
    if (
      currentChunk.length + line.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.trim(),
        chunkIndex,
        metadata: {
          lineStart: currentLineStart + 1,
          lineEnd: i,
        },
      });

      chunkIndex++;

      // Keep overlap - carry over last characters to maintain context
      if (chunkOverlap > 0 && chunks.length > 0) {
        const prevChunkContent = chunks[chunks.length - 1].content;
        currentChunk = prevChunkContent.slice(-chunkOverlap);
        // Find where the overlap starts in terms of lines
        currentLineStart = i - (prevChunkContent.split("\n").length - 1);
      } else {
        currentChunk = "";
        currentLineStart = i;
      }
    }

    currentChunk += (currentChunk.length > 0 ? "\n" : "") + line;
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      chunkIndex,
      metadata: {
        lineStart: currentLineStart + 1,
        lineEnd: lines.length,
      },
    });
  }

  return chunks;
}

/**
 * Process document: extract text and chunk
 */
export async function processDocument(
  buffer: Buffer,
  fileType: string,
  options: ProcessOptions = {},
): Promise<Chunk[]> {
  const parsed = await extractText(buffer, fileType);
  return chunkText(parsed.text, options);
}
