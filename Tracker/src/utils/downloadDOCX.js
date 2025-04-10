import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// DOCX Export
export const downloadDOCX = (documentData, signatoryDetails, currentDate, sessionDate) => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 216 * 56.7, height: 330 * 56.7 },
          margin: {
            top: 0,
            bottom: 1.5 * 567,
            left: 3.81 * 567,
            right: 2.54 * 567,
          },
        },
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: "[Logo: Cagayan de Oro]", size: 20 }),
            new TextRun({ text: "  [Logo: Golden Friendship]", size: 20 }),
            new TextRun({ text: "  [Logo: Bagong Pilipinas]", size: 20 }),
            new TextRun({ text: "  Republic of the Philippines", size: 20, bold: true }),
            new TextRun({ text: "\nCity of Cagayan de Oro", size: 28, bold: true }),
            new TextRun({ text: "\nOffice of the City Council", size: 32, bold: true }),
            new TextRun({ text: "\nwww.cdecitycouncil.com", size: 16 }),
            new TextRun({ text: "  [Logo: City Council]", size: 20 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "", size: 20 })],
          border: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "A7897D" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "123360" },
          },
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [],
          spacing: { before: 3.75 * 567 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "TRANSMITTAL SHEET", size: 32, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: currentDate, size: 30, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          indent: { left: 150 * 20 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Sirs/Mesdames:", size: 30 })],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Enclosed is a copy of ${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}, current series, passed by the City Council of this City, during its Regular Session on the `,
              size: 30,
            }),
            new TextRun({ text: `${sessionDate.day}`, size: 30, bold: true }),
            new TextRun({ text: sessionDate.suffix, size: 24, bold: true, superScript: true }),
            new TextRun({ text: ` day of ${sessionDate.month} ${sessionDate.year}`, size: 30, bold: true }),
            new TextRun({ text: ", to wit:", size: 30 }),
          ],
          indent: { firstLine: 1270 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: (documentData.title || "N/A").toUpperCase(), size: 30, bold: true })],
          alignment: AlignmentType.CENTER,
          border: { top: BorderStyle.SINGLE, bottom: BorderStyle.SINGLE, left: BorderStyle.SINGLE, right: BorderStyle.SINGLE },
          spacing: { before: 200, after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "for your information.", size: 30 })],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Thank you very much.", size: 30 })],
          indent: { firstLine: 1250 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Very truly yours", size: 30 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          children: [new TextRun({ text: signatoryDetails.name.toUpperCase(), size: 30, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: signatoryDetails.title1, size: 30 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: signatoryDetails.title2, size: 30 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: signatoryDetails.authority, size: 30 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: signatoryDetails.authorityTitle, size: 30 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Office\t\t\tReceiver Name\tSignature\tDate", size: 30, bold: true }),
          ],
          spacing: { after: 200 },
        }),
        ...(documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0
          ? documentData.transmitted_recipients.map((recipient) => (
              new Paragraph({
                children: [
                  new TextRun({ text: `${recipient.designation || "N/A"}\t\t\t\t`, size: 24 }),
                ],
                spacing: { after: 100 },
              })
            ))
          : [new Paragraph({
              children: [new TextRun({ text: "No recipients added.", size: 30 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })]),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated from the LMIS & Records Section ${new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Transmittal_Sheet_${documentData.no || 'N/A'}.docx`);
  });
};