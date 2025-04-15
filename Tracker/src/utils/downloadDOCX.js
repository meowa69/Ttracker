import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, WidthType, Footer, ImageRun, Header } from 'docx';
import { saveAs } from 'file-saver';

// Function to load the image and convert it to ArrayBuffer
const loadImageAsArrayBuffer = async (imagePath) => {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return arrayBuffer;
};

// DOCX Export
export const downloadDOCX = async (documentData, signatoryDetails, currentDate, sessionDate) => {
  // Conversion helpers
  const mmToTwips = (mm) => mm * 56.7;
  const ptToHalfPt = (pt) => pt * 2;
  const pxToTwips = (px) => px * 20; // Assuming 72 DPI (1 px = 20 twips)

  // Page dimensions (Folio: 216mm x 330mm)
  const pageWidth = mmToTwips(216);
  const pageHeight = mmToTwips(330);
  const marginLeft = mmToTwips(38.1);
  const marginRight = mmToTwips(25.4);
  const marginTop = mmToTwips(0); // No top margin
  const marginBottom = mmToTwips(15);
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Load the header image from src/assets/images/header.png
  const headerImageBuffer = await loadImageAsArrayBuffer('src/assets/images/header.png');

  // Set desired image size in pixels and convert to twips
  const desiredWidthPx = 39; // Width in pixels
  const desiredHeightPx = 5.5; // Height in pixels
  const desiredWidthTwips = pxToTwips(desiredWidthPx); // 39 * 20 = 780 twips
  const desiredHeightTwips = pxToTwips(desiredHeightPx); // 5.5 * 20 = 110 twips

  // Use exact dimensions since the image is small
  const finalWidthTwips = desiredWidthTwips;
  const finalHeightTwips = desiredHeightTwips;

  // Calculate the horizontal adjustment to shift the image 96.5mm to the left from the center
  const centerPositionTwips = (pageWidth - finalWidthTwips) / 2; // Center of the page
  const desiredShiftLeftMm = 96.5;
  const shiftLeftTwips = mmToTwips(desiredShiftLeftMm);
  const adjustedLeftIndent = centerPositionTwips - shiftLeftTwips - marginLeft;

  // Debugging output
  console.log(`Page Width: ${pageWidth} twips`);
  console.log(`Image Width: ${finalWidthTwips} twips`);
  console.log(`Image Height: ${finalHeightTwips} twips`);
  console.log(`Center Position: ${centerPositionTwips} twips`);
  console.log(`Shift Left: ${shiftLeftTwips} twips`);
  console.log(`Adjusted Left Indent: ${adjustedLeftIndent} twips`);

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: pageWidth, height: pageHeight },
          margin: {
            top: marginTop,
            bottom: marginBottom,
            left: marginLeft,
            right: marginRight,
          },
        },
      },
      headers: {
        default: null, // Disable header to avoid constraints
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `Generated from the LMIS & Records Section ${new Date().toLocaleString('en-US', { 
                    month: 'numeric', 
                    day: 'numeric', 
                    year: 'numeric', 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    hour12: true 
                  })}`, 
                  size: ptToHalfPt(10), 
                  color: "6B7280", 
                  font: "Times New Roman" 
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      children: [
        // Image as first paragraph
        new Paragraph({
          children: [
            new ImageRun({
              data: headerImageBuffer,
              transformation: {
                width: finalWidthTwips, // 780 twips
                height: finalHeightTwips, // 110 twips
              },
            }),
          ],
          alignment: AlignmentType.LEFT,
          indent: {
            left: adjustedLeftIndent,
            right: 0,
          },
          spacing: {
            before: 300, // No space above to sit at top edge
            after: 0, // No space below
            line: finalHeightTwips, // Match image height to avoid clipping
          },
          thematicBreak: false, // Prevent extra formatting
        }),
        // Title and Date
        new Paragraph({
          children: [
            new TextRun({ text: "TRANSMITTAL SHEET", size: ptToHalfPt(16), bold: true, font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: mmToTwips(8), after: mmToTwips(5) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: currentDate, size: ptToHalfPt(12), color: "4B5563", font: "Times New Roman" }),
          ],
          alignment: AlignmentType.LEFT,
          indent: { left: mmToTwips(89) },
          spacing: { after: mmToTwips(10) },
        }),
        // Body
        new Paragraph({
          children: [
            new TextRun({ text: "Sirs/Mesdames:", size: ptToHalfPt(12), font: "Times New Roman" }),
          ],
          spacing: { after: mmToTwips(10) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Enclosed is a copy of `, size: ptToHalfPt(12), font: "Times New Roman" }),
            new TextRun({ text: `${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}`, size: ptToHalfPt(12), bold: true, font: "Times New Roman" }),
            new TextRun({ text: `, current series, passed by the City Council of this City`, size: ptToHalfPt(12), font: "Times New Roman" }),
            new TextRun({ text: `, during its Regular Session on the `, size: ptToHalfPt(12), font: "Times New Roman" }),
            new TextRun({ text: `${sessionDate.day}`, size: ptToHalfPt(12), bold: true, font: "Times New Roman" }),
            new TextRun({ text: sessionDate.suffix, size: ptToHalfPt(10), bold: true, superScript: true, font: "Times New Roman" }),
            new TextRun({ text: ` day of ${sessionDate.month} ${sessionDate.year}`, size: ptToHalfPt(12), bold: true, font: "Times New Roman" }),
            new TextRun({ text: `, to wit:`, size: ptToHalfPt(12), font: "Times New Roman" }),
          ],
          indent: { firstLine: mmToTwips(10) },
          spacing: { after: 0 },
        }),
        // Title Box
        new Paragraph({
          children: [
            new TextRun({ 
              text: (documentData.title || "N/A").toUpperCase(), 
              size: ptToHalfPt(12), 
              bold: true, 
              font: "Times New Roman" ,
              padding: { left: mmToTwips(5), right: mmToTwips(5), top: mmToTwips(5), bottom: mmToTwips(5) },
              spacing: { before: mmToTwips(5), after: mmToTwips(5) },
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          border: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "374151" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "374151" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "374151" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "374151" },
          },
          indent: { left: mmToTwips((152.5 * 0.15)  / 2), right: mmToTwips((152.5 * 0.15) / 2) },
          spacing: { before: mmToTwips(10), after: mmToTwips(10) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "for your information.", size: ptToHalfPt(12), font: "Times New Roman" }),
          ],
          spacing: { before: mmToTwips(5), after: mmToTwips(5) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Thank you very much.", size: ptToHalfPt(12), font: "Times New Roman" }),
          ],
          indent: { firstLine: mmToTwips(10) },
          spacing: { before: mmToTwips(0), after: mmToTwips(6) },
        }),
        // Signature Section
        new Paragraph({
          children: [
            new TextRun({ text: "Very truly yours,", size: ptToHalfPt(12), font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(15) },
        }),
        new Paragraph({
          children: [
            new TextRun({ 
              text: signatoryDetails.name.toUpperCase(), 
              size: ptToHalfPt(11), 
              bold: true, 
              font: "Times New Roman" 
            }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(4) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: signatoryDetails.title1, size: ptToHalfPt(10), font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(4) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: signatoryDetails.title2, size: ptToHalfPt(10), font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(4) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: signatoryDetails.title3 || '', size: ptToHalfPt(10), font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(4) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: signatoryDetails.authority, size: ptToHalfPt(10), font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(4) },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: signatoryDetails.authorityTitle, size: ptToHalfPt(10), font: "Times New Roman" }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: mmToTwips(216 - 25.4 - 40 - 38.1) },
          spacing: { after: mmToTwips(15) },
        }),
        // Recipients Section (Not a Table)
        new Paragraph({
          children: [
            new TextRun({ text: "Office", size: ptToHalfPt(10), font: "Times New Roman" }),
            new TextRun({ text: "\t\t\t\t\t\t\t\t\t\t\t\t\t\tReceiver Name", size: ptToHalfPt(10), font: "Times New Roman" }),
            new TextRun({ text: "\t\t\t\t\t\tSignature", size: ptToHalfPt(10), font: "Times New Roman" }),
            new TextRun({ text: "\t\t\t\t\tDate", size: ptToHalfPt(10), font: "Times New Roman" }),
          ],
          spacing: { after: mmToTwips(10) },
        }),
        ...(documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0
          ? documentData.transmitted_recipients.flatMap((recipient) => [
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: (recipient.designation || "N/A").substring(0, 30),
                    size: ptToHalfPt(10), 
                    font: "Times New Roman" 
                  }),
                  new TextRun({ text: "\t\t\t\t\t\t\t\t\t\t\t\t\t\t", size: ptToHalfPt(10) }),
                  new TextRun({ text: "____________________", size: ptToHalfPt(10), font: "Times New Roman" }),
                  new TextRun({ text: "\t\t\t\t\t", size: ptToHalfPt(10) }),
                  new TextRun({ text: "____________________", size: ptToHalfPt(10), font: "Times New Roman" }),
                  new TextRun({ text: "\t\t\t\t\t", size: ptToHalfPt(10) }),
                  new TextRun({ text: "____________________", size: ptToHalfPt(10), font: "Times New Roman" }),
                ],
                spacing: { before: mmToTwips(0), after: mmToTwips(5) },
              }),
            ])
          : [
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "No recipients added.", 
                    size: ptToHalfPt(10), 
                    font: "Times New Roman" 
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: mmToTwips(5) },
              }),
            ]),
      ],
    }],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Transmittal_Sheet_${documentData.no || 'N/A'}.docx`);
  });
};