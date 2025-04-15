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
      customLineHeight = size * 0.4, // Allow custom line height for specific cases
    } = options;
  
    doc.setFontSize(size);
    doc.setTextColor(...color);
  
    // If no bold phrases or superscript, or entire text is bold
    if (boldPhrases.length === 0 && !superscript) {
      doc.setFont('times', bold ? 'bold' : italic ? 'italic' : 'normal');
      const lines = doc.splitTextToSize(String(text), maxWidth - indent);
      const lineHeight = customLineHeight; // Use custom line height if provided

      if (align === 'justify' && lines.length > 0) {
        lines.forEach((line, index) => {
          const lineY = y + index * lineHeight;
          const isLastLine = index === lines.length - 1;
          const words = line.trim().split(' ').filter(word => word);
          
          if (isLastLine && words.length <= 2) {
            doc.text(line, x + indent, lineY, { align: 'left' });
          } else if (words.length > 1) {
            const totalTextWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
            const totalSpaces = words.length - 1;
            const spaceWidth = (maxWidth - indent - totalTextWidth) / totalSpaces;
            let currentX = x + indent;

            words.forEach((word, i) => {
              doc.text(word, currentX, lineY);
              if (i < words.length - 1) {
                currentX += doc.getTextWidth(word) + spaceWidth;
              }
            });
          } else {
            doc.text(line, x + indent, lineY);
          }
        });
      } else {
        doc.text(lines, x + indent, y, { align });
      }
      return lines.length * lineHeight;
    }
  
    // Handle text with bold phrases and/or superscript
    const lines = doc.splitTextToSize(String(text), maxWidth - indent);
    const lineHeight = customLineHeight || (size * 0.4);
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
  
          const dateIndex = remainingText.indexOf(fullDateStr);
          if (dateIndex !== -1) {
            if (dateIndex > 0) {
              const beforeDate = remainingText.substring(0, dateIndex);
              doc.setFont('times', 'normal');
              doc.text(beforeDate, currentX, y + lineIndex * lineHeight);
              currentX += doc.getTextWidth(beforeDate);
              remainingText = remainingText.substring(dateIndex);
            }
  
            // Always bold the full date string (day + suffix)
            doc.setFont('times', 'bold');
            doc.text(dayStr, currentX, y + lineIndex * lineHeight);
            currentX += doc.getTextWidth(dayStr);
  
            doc.setFontSize(size * 0.6);
            doc.setFont('times', 'bold'); // Ensure suffix is bold
            doc.text(suffix, currentX, y + lineIndex * lineHeight - size * 0.15);
            currentX += doc.getTextWidth(suffix);
            doc.setFontSize(size);
  
            remainingText = remainingText.substring(fullDateStr.length);
            foundSuperscript = true;
          }
        }
  
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
  addText('Republic of the Philippines', { x: textX + 31, y: textY + 4, size: 11, align: 'center', maxWidth: textAreaWidth });
  textY += lineSpacing;
  addText('CITY OF CAGAYAN DE ORO', { x: textX + 33, y: textY + 5, size: 12, align: 'center', maxWidth: textAreaWidth });
  textY += lineSpacing;
  addText('OFFICE OF THE CITY COUNCIL', { x: textX + 33, y: textY + 6, size: 13, bold: true, align: 'center', maxWidth: textAreaWidth });
  textY += lineSpacing;
  addText('www.cdecitycouncil.com', { x: textX + 31.5, y: textY + 6.5, size: 8, align: 'center', color: [107, 114, 128], maxWidth: textAreaWidth });

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

  const bodyText = `Enclosed is a copy of ${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}, current series, passed by the City Council of this City, during its Regular Session on the ${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}, to wit:`;
  const documentPhrase = `${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}`;
  const datePhrase = `${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}`;
  const monthPhrase = `day of ${sessionDate.month}`;
  const yearPhrase = `${sessionDate.year}`;
  const fullDateStr = `${String(sessionDate.day)}${sessionDate.suffix}`; // For bolding day + suffix

  // Split the body text at "City"
  const splitIndex = bodyText.indexOf('City') + 'City'.length;
  const indentedText = bodyText.substring(0, splitIndex); // "Enclosed is a copy of ... City"
  const remainingText = bodyText.substring(splitIndex); // ", during its Regular Session ..."

  // Render the indented part
  const indentedHeight = addText(indentedText, { 
    size: 12, 
    maxWidth: contentWidth,
    boldPhrases: [documentPhrase], // Only the document phrase might be in this part
    indent: 10 // 10mm indent
  });

  // Adjust yPosition after the indented part
  yPosition += indentedHeight;

  // Render the remaining part without indent
  yPosition += addText(remainingText, { 
    size: 12, 
    maxWidth: contentWidth,
    boldPhrases: [datePhrase, monthPhrase, yearPhrase, fullDateStr],
    superscript: true,
    indent: 0 // No indent for the remaining text
  });
  
  // Title Box
  yPosition += 5;
  const title = documentData.title || 'N/A';
  doc.setDrawColor(55, 65, 81);
  doc.setLineWidth(0.1); // Set border thickness to 0.3mm for a lighter border
  const boxWidth = contentWidth * 0.85;
  const boxX = marginLeft + (contentWidth - boxWidth) / 2;

  // Calculate text dimensions
  const titleText = title.toUpperCase();
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  const textLines = doc.splitTextToSize(titleText, boxWidth - 8); // 4mm padding on each side
  const titleLineHeight = 12 * 0.5; // Line height for title (6mm per line)
  const textHeight = textLines.length * titleLineHeight;
  const paddingTopBottom = 3; // 3mm padding for top and bottom
  const boxHeight = textHeight + paddingTopBottom * 2; // Dynamically adjust box height

  // Draw the box
  doc.rect(boxX, yPosition, boxWidth, boxHeight, 'S');

  // Calculate starting Y position to vertically center the text in the box
  const textBlockHeight = textLines.length * titleLineHeight;
  const yStart = yPosition + paddingTopBottom + (boxHeight - textBlockHeight) / 2;

  // Add title text, ensuring it stays within the box
  addText(titleText, { 
    x: boxX + 4, // 4mm left padding
    y: yStart, // Vertically centered
    size: 12, 
    bold: true, 
    align: 'justify', // Justified text
    maxWidth: boxWidth - 8, // 4mm padding on each side
    customLineHeight: titleLineHeight // Use specified line height for title
  });
  yPosition += boxHeight + 5;

  // Additional Text
  yPosition += 5;
  yPosition += addText('for your information.', { size: 12 });
  yPosition += 5;
  yPosition += addText('Thank you very much.', { size: 12, indent: 10 });
  yPosition += 6;

  // Signature Section
  const signatureX = pageWidth - marginRight - 40; // Align text to end at right margin
  addText('Very truly yours,', { size: 12, x: signatureX, align: 'center' });
  yPosition += 15;
  addText(signatoryDetails.name.toUpperCase(), { size: 11, bold: true, x: signatureX, align: 'center' });
  yPosition += 4;
  addText(signatoryDetails.title1, { size: 10, x: signatureX, align: 'center' });
  yPosition += 4;
  addText(signatoryDetails.title2, { size: 10, x: signatureX, align: 'center' });
  yPosition += 4;
  addText(signatoryDetails.title3 || '', { size: 10, x: signatureX, align: 'center' });
  yPosition += 4;
  addText(signatoryDetails.authority, { size: 10, x: signatureX, align: 'center' });
  yPosition += 4;
  addText(signatoryDetails.authorityTitle, { size: 10, x: signatureX, align: 'center' });
  yPosition += 15; // Increased spacing after signature section

  // Recipients Table
  // Define column widths (in mm) to match the image proportions
  const colWidths = {
    office: 45, // Wider for office names
    receiverName: 35,
    signature: 30,
    date: 25,
  };

  // Calculate column positions for headers and underlines
  const headerXPositions = {
    office: marginLeft + 10,
    receiverName: marginLeft + colWidths.office + 23,
    signature: marginLeft + colWidths.office + colWidths.receiverName + 23,
    date: marginLeft + colWidths.office + colWidths.receiverName + colWidths.signature + 19.25, // Adjusted offset
  };

  // Table Header
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  // Align "Office" header to the left
  doc.text('Office', headerXPositions.office, yPosition, { align: 'left' });
  doc.text('Receiver Name', headerXPositions.receiverName + colWidths.receiverName / 2, yPosition, { align: 'center' });
  doc.text('Signature', headerXPositions.signature + colWidths.signature / 2, yPosition, { align: 'center' });
  doc.text('Date', headerXPositions.date + colWidths.date / 2, yPosition, { align: 'center' });
  yPosition += 10; // Space after header (no underlines)

  if (documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0) {
    documentData.transmitted_recipients.forEach((recipient) => {
      const designation = recipient.designation || 'N/A';
      const truncatedDesignation = doc.splitTextToSize(designation, colWidths.office - 5)[0];

      doc.setFontSize(10);
      doc.text(truncatedDesignation, headerXPositions.office, yPosition, { align: 'left' });
      yPosition += 1; 

      doc.setLineWidth(0.1);
      doc.setDrawColor(0, 0, 0);

      const receiverNameLineWidth = (colWidths.receiverName - 10) * 1.5; // 10% wider
      const receiverNameX1 = headerXPositions.receiverName + (colWidths.receiverName - receiverNameLineWidth) / 2;
      const receiverNameX2 = receiverNameX1 + receiverNameLineWidth;
      doc.line(receiverNameX1, yPosition, receiverNameX2, yPosition);

      // Signature underline
      const signatureLineWidth = colWidths.signature - 10; // Fixed length
      const signatureX1 = headerXPositions.signature + (colWidths.signature - signatureLineWidth) / 2;
      const signatureX2 = signatureX1 + signatureLineWidth;
      doc.line(signatureX1, yPosition, signatureX2, yPosition);

      // Date underline (match Signature length for consistency)
      const dateLineWidth = signatureLineWidth; // Same as Signature
      const dateX1 = headerXPositions.date + (colWidths.date - dateLineWidth) / 2;
      const dateX2 = dateX1 + dateLineWidth;
      doc.line(dateX1, yPosition, dateX2, yPosition);

      yPosition += 5; // Space between rows
    });
  } else {
    yPosition += addText('No recipients added.', { size: 10, align: 'center', x: pageWidth / 2 });
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