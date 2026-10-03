import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface WaiverData {
  studentName: string;
  studentId: string;
  equipmentName: string;
  checkoutDate: string;
  returnDate: string;
  signature: string; // Base64 image
  signatureDate: string;
}

export async function generateWaiverPDF(waiverData: WaiverData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let yPosition = height - 50;

  // Header
  page.drawText('EQUIPMENT CHECKOUT WAIVER', {
    x: 50,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 40;

  // Catawba College branding
  page.drawText('Catawba College - Communication Arts and Media', {
    x: 50,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.6),
  });
  yPosition -= 30;

  // Waiver content
  const content = `
This waiver is for the checkout of equipment from the Catawba College Communication Arts and Media department.

STUDENT INFORMATION:
Name: ${waiverData.studentName}
Student ID: ${waiverData.studentId}

EQUIPMENT INFORMATION:
Equipment: ${waiverData.equipmentName}
Checkout Date: ${waiverData.checkoutDate}
Expected Return: ${waiverData.returnDate}

TERMS AND CONDITIONS:

1. I acknowledge that I am responsible for the safekeeping, proper use, and return of the equipment listed above.

2. I understand that I am liable for any damage or loss to the equipment while it is in my possession, except for normal wear and tear.

3. I agree to return the equipment by the specified return date and time. Late returns may result in loss of checkout privileges.

4. I understand that the equipment is for educational purposes related to my coursework in the Communication Arts and Media program.

5. I agree to follow all department policies and procedures for equipment use.

6. I understand that misuse or negligence may result in disciplinary action and/or financial responsibility for repairs or replacement.

7. I acknowledge that I have received training on the proper use of this equipment.

8. I understand that I may be required to sign additional equipment-specific waivers for specialized gear.

By signing below, I acknowledge that I have read, understood, and agree to these terms and conditions.
  `.trim();

  page.drawText(content, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    maxWidth: 500,
    lineHeight: 14,
  });

  yPosition -= 150;

  // Signature section
  page.drawText('STUDENT SIGNATURE:', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
  });
  yPosition -= 30;

  // Draw signature image if provided
  if (waiverData.signature) {
    try {
      const signatureImage = await pdfDoc.embedPng(waiverData.signature);
      page.drawImage(signatureImage, {
        x: 50,
        y: yPosition - 60,
        width: 200,
        height: 60,
      });
    } catch (error) {
      // If signature embedding fails, draw placeholder text
      page.drawText('[Signature]', {
        x: 50,
        y: yPosition - 40,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  yPosition -= 80;

  // Date signed
  page.drawText(`Date Signed: ${waiverData.signatureDate}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
  });

  yPosition -= 40;

  // Footer
  page.drawText('Catawba College Communication Arts and Media', {
    x: 50,
    y: yPosition,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  yPosition -= 20;
  page.drawText('Page 1 of 1', {
    x: 50,
    y: yPosition,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Serialize the PDF
  return await pdfDoc.save();
}
