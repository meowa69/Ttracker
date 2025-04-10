import { jsPDF } from 'jspdf';
import {
  cdo_logoBase64,
  goldenfriendship_logoBase64,
  bagongpilipinas_logoBase64,
  CityC_LogoBase64,
} from './logoImages';

export const downloadPDF = (documentData, signatoryDetails, currentDate, sessionDate, docNo, preview = false) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [216, 330], // Folio size
    orientation: 'portrait',
  });

  // Margins
  const marginLeft = 38.1; // ~3.81cm
  const marginRight = 25.4; // ~2.54cm
  const marginTop = 20; // ~mt-5
  const marginBottom = 15; // ~mb-4
  const pageWidth = 216;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let yPosition = marginTop;

  // Helper function to add text with bold phrases and superscript suffix
  const addText = (text, options = {}) => {
    const {
      x = marginLeft,
      y = yPosition,
      size = 12,
      bold = false,
      italic = false,
      align = 'left',
      indent = 0,
      maxWidth = contentWidth,
      color = [55, 65, 81],
      boldPhrases = [],
      superscript = null,
    } = options;
  
    doc.setFontSize(size);
    doc.setTextColor(...color);
  
    // If no bold phrases or superscript, or entire text is bold
    if (boldPhrases.length === 0 && !superscript && bold) {
      doc.setFont('times', bold ? 'bold' : italic ? 'italic' : 'normal');
      const lines = doc.splitTextToSize(String(text), maxWidth - indent);
      doc.text(lines, x + indent, y, { align });
      return lines.length * (size * 0.35);
    }
  
    // Handle text with bold phrases and/or superscript
    const lines = doc.splitTextToSize(String(text), maxWidth - indent);
    const lineHeight = size * 0.35;
    let totalHeight = 0;
  
    lines.forEach((line, lineIndex) => {
      let currentX = x + indent;
      let remainingText = line;
  
      while (remainingText.length > 0) {
        let foundBold = false;
        let foundSuperscript = false;
  
        // Check for bold phrases
        for (const phrase of boldPhrases) {
          if (remainingText.startsWith(phrase)) {
            doc.setFont('times', 'bold');
            doc.text(phrase, currentX, y + lineIndex * lineHeight);
            currentX += doc.getTextWidth(phrase);
            remainingText = remainingText.substring(phrase.length);
            foundBold = true;
            break;
          }
        }
  
        // Check for superscript if provided
        if (!foundBold && superscript) {
          const dayStr = String(sessionDate.day);
          const suffix = sessionDate.suffix;
          const fullDateStr = dayStr + suffix;
  
          // Look for fullDateStr anywhere in the remainingText (not just start)
          const dateIndex = remainingText.indexOf(fullDateStr);
          if (dateIndex !== -1) {
            // Print text before the date normally
            if (dateIndex > 0) {
              const beforeDate = remainingText.substring(0, dateIndex);
              doc.setFont('times', 'normal');
              doc.text(beforeDate, currentX, y + lineIndex * lineHeight);
              currentX += doc.getTextWidth(beforeDate);
              remainingText = remainingText.substring(dateIndex);
            }
  
            // Print the day normally
            doc.setFont('times', boldPhrases.includes(datePhrase) ? 'bold' : 'normal');
            doc.text(dayStr, currentX, y + lineIndex * lineHeight);
            currentX += doc.getTextWidth(dayStr);
  
            // Print the suffix as superscript
            doc.setFontSize(size * 0.6);
            doc.text(suffix, currentX, y + lineIndex * lineHeight - size * 0.15);
            currentX += doc.getTextWidth(suffix);
            doc.setFontSize(size);
  
            remainingText = remainingText.substring(fullDateStr.length);
            foundSuperscript = true;
          }
        }
  
        // If no bold or superscript, print normally
        if (!foundBold && !foundSuperscript) {
          const nextSpace = remainingText.indexOf(' ') === -1 ? remainingText.length : remainingText.indexOf(' ');
          const nextText = remainingText.substring(0, nextSpace + 1);
          doc.setFont('times', 'normal');
          doc.text(nextText, currentX, y + lineIndex * lineHeight);
          currentX += doc.getTextWidth(nextText);
          remainingText = remainingText.substring(nextSpace + 1);
        }
      }
      totalHeight = (lineIndex + 1) * lineHeight;
    });
  
    return totalHeight;
  };

  // Helper function to draw a solid line
  const drawLine = (x1, y, x2, color, thickness = 0.3) => {
    doc.setLineWidth(thickness);
    doc.setDrawColor(...color);
    doc.line(x1, y, x2, y);
  };

  // Helper function to interpolate between two colors
  const interpolateColor = (color1, color2, factor) => {
    const result = color1.map((channel, index) => {
      return Math.round(channel + factor * (color2[index] - channel));
    });
    return result;
  };

  // Helper function to draw a gradient line
  const drawGradientLine = (x1, y, x2, colors, thickness = 0.3) => {
    const lineWidth = x2 - x1;
    const segmentWidth = 1;
    const numSegments = Math.ceil(lineWidth / segmentWidth);
    const halfSegments = numSegments / 2;

    const startColor = colors[0];
    const midColor = colors[1];
    const endColor = colors[2];

    doc.setLineWidth(thickness);

    for (let i = 0; i < numSegments; i++) {
      const segmentX1 = x1 + i * segmentWidth;
      const segmentX2 = Math.min(segmentX1 + segmentWidth, x2);
      const factor = i / numSegments;

      let color;
      if (i < halfSegments) {
        const subFactor = (i / halfSegments);
        color = interpolateColor(startColor, midColor, subFactor);
      } else {
        const subFactor = ((i - halfSegments) / halfSegments);
        color = interpolateColor(midColor, endColor, subFactor);
      }

      doc.setDrawColor(...color);
      doc.line(segmentX1, y, segmentX2, y);
    }
  };

  // Header: Logos and Text
  const logos = {
    cdo: {
      image: cdo_logoBase64,
      width: 25,
      height: 25,
      x: 5,
      y: yPosition + -15,
    },
    goldenfriendship: {
      image: goldenfriendship_logoBase64,
      width: 18,
      height: 9,
      x: 32,
      y: yPosition + -7,
    },
    bagongpilipinas: {
      image: bagongpilipinas_logoBase64,
      width: 25,
      height: 25,
      x: 49,
      y: yPosition + -15,
    },
    cityCouncil: {
      image: CityC_LogoBase64,
      width: 25,
      height: 25,
      x: pageWidth - 30,
      y: yPosition + -15,
    },
  };

  Object.values(logos).forEach((logo) => {
    doc.addImage(logo.image, 'PNG', logo.x, logo.y, logo.width, logo.height);
  });

  const headerHeight = Math.max(...Object.values(logos).map(logo => logo.height));
  const leftLogosWidth = logos.bagongpilipinas.x + logos.bagongpilipinas.width - logos.cdo.x;
  const rightLogoWidth = logos.cityCouncil.width;
  const textAreaWidth = pageWidth - leftLogosWidth - rightLogoWidth - 10;

  const textXOffset = 0;
  const textYOffset = -10;
  const lineSpacing = 4;
  const textX = logos.bagongpilipinas.x + logos.bagongpilipinas.width + 5 + textXOffset;

  const textYStart = yPosition + textYOffset;
  let textY = textYStart;
  addText('Republic of the Philippines', { x: textX + 10.5, y: textY + 4, size: 11, align: 'center', maxWidth: textAreaWidth });
  textY += lineSpacing;
  addText('CITY OF CAGAYAN DE ORO', { x: textX + 6, y: textY + 5, size: 12, align: 'center', maxWidth: textAreaWidth });
  textY += lineSpacing;
  addText('OFFICE OF THE CITY COUNCIL', { x: textX + 33, y: textY + 6, size: 13, bold: true, align: 'center', maxWidth: textAreaWidth });
  textY += lineSpacing;
  addText('www.cdecitycouncil.com', { x: textX + 20, y: textY + 6.5, size: 8, align: 'center', color: [107, 114, 128], maxWidth: textAreaWidth });

  yPosition += headerHeight + -12;

  const borderThickness = 0.5;
  drawLine(5, yPosition, pageWidth - 5, [167, 137, 125], borderThickness);
  yPosition += 1 + borderThickness / 4;
  drawGradientLine(5, yPosition, pageWidth - 5, [
    [118, 173, 184],
    [63, 111, 139],
    [18, 51, 96],
  ], borderThickness);
  yPosition += 10 + borderThickness / 4;

  // Title and Date
  const titleXOffset = 0;
  const titleX = marginLeft + titleXOffset;
  addText('TRANSMITTAL SHEET', { x: titleX + 75, y: titleX + 10, size: 16, bold: true, align: 'center', maxWidth: contentWidth });
  yPosition += 8; // Initial adjustment after title
  yPosition += 5; // 1 gap (single line space) between title and date, approximately 5mm
  addText(currentDate, { size: 12, align: 'left', indent: 89, y: yPosition, color: [75, 85, 99] });
  yPosition += 10;

  // Body
  addText('Sirs/Mesdames:', { size: 12 });
  yPosition += 10;

  const bodyText = `            Enclosed is a copy of ${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}, current series, passed by the City Council of this City, during its Regular Session on the ${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}, to wit:`;
  const documentPhrase = `${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}`;
  const datePhrase = `${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}`;
  const monthPhrase = `day of ${sessionDate.month}`;
  const yearPhrase = `${sessionDate.year}`;

  yPosition += addText(bodyText, { 
    size: 12, 
    maxWidth: contentWidth,
    boldPhrases: [documentPhrase, datePhrase, monthPhrase, yearPhrase],
    superscript: true,
  });
  
  // Title Box
  yPosition += 5;
  const title = documentData.title || 'N/A';
  doc.setDrawColor(55, 65, 81);
  doc.setLineWidth(0.5);
  const boxWidth = contentWidth * 0.9;
  const boxX = marginLeft + (contentWidth - boxWidth) / 2;
  const boxHeight = 30;
  doc.rect(boxX, yPosition - 2, boxWidth, boxHeight, 'S');
  addText(title.toUpperCase(), { 
    x: boxX, 
    y: yPosition + 2, 
    size: 12, 
    bold: true, 
    align: 'center', 
    maxWidth: boxWidth 
  });
  yPosition += boxHeight + 5;

  // Additional Text
  yPosition += addText('for your information.', { size: 12 });
  yPosition += 5;
  yPosition += addText('Thank you very much.', { size: 12 });
  yPosition += 6;

  // Signature Section
  addText('Very truly yours,', { size: 15, align: 'center' });
  yPosition += 8;
  addText(signatoryDetails.name.toUpperCase(), { size: 15, bold: true, align: 'center' });
  yPosition += 3;
  addText(signatoryDetails.title1, { size: 15, align: 'center' });
  yPosition += 3;
  addText(signatoryDetails.title2, { size: 15, align: 'center' });
  yPosition += 3;
  addText(signatoryDetails.authority, { size: 15, align: 'center' });
  yPosition += 3;
  addText(signatoryDetails.authorityTitle, { size: 15, align: 'center' });
  yPosition += 8;

  // Recipients Table
  addText('Office                          Receiver Name    Signature    Date', { size: 15, bold: true });
  yPosition += 4;
  if (documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0) {
    documentData.transmitted_recipients.forEach((recipient) => {
      const designation = recipient.designation || 'N/A';
      const rowText = `${designation.padEnd(30)} __________    __________    __________`;
      yPosition += addText(rowText, { size: 12 });
      yPosition += 2;
    });
  } else {
    yPosition += addText('No recipients added.', { size: 15, align: 'center' });
  }

  // Footer
  const footerText = `Generated from the LMIS & Records Section ${new Date().toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })}`;
  addText(footerText, {
    x: pageWidth - marginRight,
    y: 330 - marginBottom,
    size: 10,
    align: 'right',
    color: [107, 114, 128],
  });

  if (preview) {
    return doc.output('datauristring');
  } else {
    doc.save(`Transmittal_Sheet_${docNo || 'N/A'}.pdf`);
  }
};