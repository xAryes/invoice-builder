import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportToPDF = async (element, filename = 'invoice.pdf') => {
  if (!element) {
    throw new Error('Element not provided for PDF export')
  }

  // Create canvas from element
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  // Calculate dimensions for A4
  const imgWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Add image to PDF (JPEG is more reliable with jsPDF)
  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)

  // If content exceeds one page by more than 5mm, add more pages
  // This threshold prevents blank pages from small pixel overflow
  let heightLeft = imgHeight - pageHeight
  let position = -pageHeight

  while (heightLeft > 5) {
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    position -= pageHeight
  }

  // Save the PDF
  pdf.save(filename)
}

export const exportToPDFWithAttachments = async (element, attachments = [], filename = 'expense-report.pdf') => {
  if (!element) throw new Error('Element not provided for PDF export')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgWidth = 210
  const pageHeight = 297
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)

  let heightLeft = imgHeight - pageHeight
  let position = -pageHeight
  while (heightLeft > 5) {
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    position -= pageHeight
  }

  // Append image attachments as extra pages
  for (const att of attachments) {
    await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        pdf.addPage()
        // Header
        pdf.setFontSize(10)
        pdf.setTextColor(100, 116, 139)
        pdf.text(`Attachment: ${att.name}`, 12, 14)
        if (att.expenseDescription) {
          pdf.setFontSize(8)
          pdf.text(att.expenseDescription, 12, 20)
        }

        const margin = 12
        const topOffset = att.expenseDescription ? 26 : 20
        const maxW = imgWidth - margin * 2
        const maxH = pageHeight - topOffset - margin

        let w = img.width
        let h = img.height
        const ratio = Math.min(maxW / w, maxH / h, 1)
        w *= ratio
        h *= ratio

        // Draw centered
        const x = margin + (maxW - w) / 2
        pdf.addImage(att.data, 'JPEG', x, topOffset, w, h)
        resolve()
      }
      img.onerror = resolve
      img.src = att.data
    })
  }

  pdf.save(filename)
}

export const generatePDFBlob = async (element) => {
  if (!element) {
    throw new Error('Element not provided for PDF export')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)

  return pdf.output('blob')
}
