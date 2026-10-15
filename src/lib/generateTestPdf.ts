import { jsPDF } from 'jspdf';
import type { Card } from '../types';

export interface TestPdfQuestion {
  id: string;
  card: Card;
  type: 'multiple-choice' | 'written';
  options?: string[];
}

export function generateTestPdf(deckTitle: string, questions: TestPdfQuestion[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin;

  let y = margin;

  // Helper to ensure page bounds
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > bottomThreshold) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // ==========================================
  // PAGE 1: EXAM HEADER
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text(deckTitle, margin, y);
  y += 7;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text('Practice Test', margin, y);
  y += 4;

  // Subtle divider
  doc.setDrawColor(210, 210, 215);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  // Student info bar
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Name: ___________________________________', margin, y);
  doc.text('Date: _______________', margin + 95, y);
  doc.text(`Score: ______ / ${questions.length}`, margin + 140, y);
  y += 12;

  // ==========================================
  // QUESTIONS SECTION
  // ==========================================
  questions.forEach((q, idx) => {
    const qNumber = `${idx + 1}.`;
    const promptText = q.card.definition;

    // Estimate height needed
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const promptLines = doc.splitTextToSize(`${qNumber}  ${promptText}`, contentWidth);
    const promptHeight = promptLines.length * 5.5;

    let totalQuestionHeight = promptHeight + 10;
    if (q.type === 'multiple-choice' && q.options) {
      totalQuestionHeight += q.options.length * 6.5;
    } else {
      totalQuestionHeight += 16; // space for handwriting
    }

    checkPageBreak(totalQuestionHeight);

    // Print Prompt
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 25, 25);
    doc.text(promptLines, margin, y);
    y += promptHeight + 2;

    // Print Options or Blank Line
    if (q.type === 'multiple-choice' && q.options) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);

      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, optIdx) => {
        const letter = letters[optIdx] || `${optIdx + 1}`;
        const optionLines = doc.splitTextToSize(`${letter})  ${opt}`, contentWidth - 8);
        doc.text(optionLines, margin + 6, y);
        y += optionLines.length * 5.5;
      });
      y += 5;
    } else {
      // Short Answer Blank Line
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Answer: ____________________________________________________________________', margin + 6, y);
      y += 14; // handwriting room
    }
  });

  // ==========================================
  // FINAL PAGE: SEPARATE ANSWER KEY
  // ==========================================
  doc.addPage();
  y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text('Answer Key', margin, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${deckTitle} — ${questions.length} Questions`, margin, y);
  y += 4;

  doc.setDrawColor(210, 210, 215);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 9;

  // Render Answers
  const letters = ['A', 'B', 'C', 'D'];
  questions.forEach((q, idx) => {
    let answerText = q.card.term;
    if (q.type === 'multiple-choice' && q.options) {
      const correctIdx = q.options.indexOf(q.card.term);
      if (correctIdx !== -1) {
        answerText = `(${letters[correctIdx]}) ${q.card.term}`;
      }
    }

    doc.setFontSize(10.5);
    const answerLines = doc.splitTextToSize(`${idx + 1}.  ${answerText}`, contentWidth);
    const lineH = answerLines.length * 5.5 + 2;

    checkPageBreak(lineH);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`${idx + 1}.`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(answerLines[0].substring(`${idx + 1}.  `.length), margin + 8, y);

    // Multi-line wrap if term is very long
    if (answerLines.length > 1) {
      for (let i = 1; i < answerLines.length; i++) {
        y += 5;
        doc.text(answerLines[i], margin + 8, y);
      }
    }

    y += 6.5;
  });

  // Save the PDF file
  const sanitizedTitle = deckTitle.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 40);
  const fileName = `${sanitizedTitle}-Practice-Test.pdf`;
  doc.save(fileName);
}
