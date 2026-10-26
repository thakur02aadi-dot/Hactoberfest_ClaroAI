/**
 * Client OCR and PDF Parsing Service
 * Uses Tesseract.js for image recognition and PDF.js for PDF documents
 */

import { createWorker } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface ExtractedNoticeDocument {
  text: string;
  sourceType: 'image' | 'pdf' | 'pasted_text' | 'demo';
  fileName?: string;
  confidenceScore: number;
  warnings: string[];
}

/**
 * Extracts text from an image file using Tesseract.js OCR
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<ExtractedNoticeDocument> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: Math.round((m.progress || 0) * 100),
          });
        }
      },
    });

    const ret = await worker.recognize(imageUrl);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    const text = ret.data.text.trim();
    const confidenceScore = ret.data.confidence || 85;

    const warnings: string[] = [];
    if (confidenceScore < 60) {
      warnings.push('Low OCR confidence score detected. Please carefully review and correct numbers and dates.');
    }
    if (text.length < 30) {
      warnings.push('Extracted text is very short. Please verify that the image is clear and well-lit.');
    }

    return {
      text,
      sourceType: 'image',
      fileName: file.name,
      confidenceScore,
      warnings,
    };
  } catch (error: any) {
    URL.revokeObjectURL(imageUrl);
    throw new Error(`Failed to extract text from image: ${error.message || error}`);
  }
}

/**
 * Extracts text from a PDF file using PDF.js.
 * If text layer is sparse/empty (scanned PDF), renders pages to canvas and runs Tesseract.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<ExtractedNoticeDocument> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker source to CDN or local fallback
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, 5); // Safe limit of 5 pages for hackathon / mobile performance

    let fullText = '';
    let totalItems = 0;

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        onProgress({
          status: `Extracting page ${i} of ${numPages}`,
          progress: Math.round((i / numPages) * 70),
        });
      }
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore - item has str property in pdfjs
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      fullText += pageText + '\n\n';
      totalItems += textContent.items.length;
    }

    // Check if PDF appears to be a scanned image with no embedded text
    if (totalItems < 15 && numPages > 0) {
      if (onProgress) {
        onProgress({
          status: 'Scanned PDF detected. Rendering page to OCR...',
          progress: 80,
        });
      }

      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        // @ts-ignore
        await firstPage.render({ canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const imageFile = new File([blob], `${file.name}-page1.png`, { type: 'image/png' });
          const ocrResult = await extractTextFromImage(imageFile, onProgress);
          return {
            ...ocrResult,
            sourceType: 'pdf',
            fileName: file.name,
            warnings: [
              'This document appears to be a scanned image PDF. Text was extracted using optical character recognition.',
              ...ocrResult.warnings,
            ],
          };
        }
      }
    }

    const trimmedText = fullText.trim();
    return {
      text: trimmedText,
      sourceType: 'pdf',
      fileName: file.name,
      confidenceScore: 95,
      warnings: trimmedText.length < 50 ? ['The PDF contains very little text. Please review the extracted content.'] : [],
    };
  } catch (error: any) {
    throw new Error(`Failed to read PDF document: ${error.message || error}`);
  }
}
