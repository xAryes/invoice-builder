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
