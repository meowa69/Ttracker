import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { downloadPDF } from '../utils/downloadPDF';
import { downloadDOCX } from '../utils/downloadDOCX';

// SVG icons for PDF, DOCX, and Preview
const PDFIcon = () => (
  <img src="src/assets/Images/pdf.png" alt="PDF Icon" className="w-6 h-6" />
);

const DOCXIcon = () => (
  <img src="src/assets/Images/docx.png" alt="DOCX Icon" className="w-6 h-6" />
);

const PreviewIcon = () => (
  <img src="src/assets/Images/preview.png" alt="Preview Icon" className="w-6 h-6" />
);

export const TransmittalSheet = ({ documentData, onPrint, onClose }) => {
  const componentRef = useRef();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [signatoryDetails, setSignatoryDetails] = useState({
    name: "KATHRINA RAIZA A. MACADADAG",
    title1: "Information Technology I",
    title2: "Chief, Legislative Management Information System & Records Section",
    authority: "By authority of MR. ARTURO S. DE SAN MIGUEL",
    authorityTitle: "City Secretary",
  });

  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [cachedPdfUrl, setCachedPdfUrl] = useState(null);
  const [lastGeneratedData, setLastGeneratedData] = useState(null);

  const getOrdinalSuffix = (day) => {
    if (day % 10 === 1 && day !== 11) return "st";
    if (day % 10 === 2 && day !== 12) return "nd";
    if (day % 10 === 3 && day !== 13) return "rd";
    return "th";
  };

  const formatSessionDate = (dateString) => {
    if (!dateString) return { day: "N/A", suffix: "", month: "", year: "" };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { day: "N/A", suffix: "", month: "", year: "" };
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const suffix = getOrdinalSuffix(day);
    return { day, suffix, month, year };
  };

  const sessionDate = formatSessionDate(documentData.date_approved);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Transmittal_Sheet_${documentData.no || 'N/A'}`,
    onAfterPrint: () => onPrint(),
    pageStyle: `
      @page {
        size: 216mm 330mm;
        margin: 0;
      }
    `,
  });

  const handleInputChange = (field, value) => {
    setSignatoryDetails((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (isPreviewModalOpen) {
          setIsPreviewModalOpen(false);
          if (pdfUrl && pdfUrl !== cachedPdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isPreviewModalOpen, pdfUrl, cachedPdfUrl]);

  const handleDownloadPDF = () => {
    downloadPDF(documentData, signatoryDetails, currentDate, sessionDate, documentData.no);
  };

  const dataUrlToBlob = (dataUrl) => {
    const base64Index = dataUrl.indexOf('base64,');
    if (base64Index === -1) throw new Error('Invalid PDF data URL');
    const base64Data = dataUrl.substring(base64Index + 7);
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type: 'application/pdf' });
  };

  const handlePreviewPDF = () => {
    const currentData = JSON.stringify({ documentData, signatoryDetails, currentDate, sessionDate });

    // Always generate a new PDF to ensure a refresh
    try {
      // Revoke the previous cached URL if it exists
      if (cachedPdfUrl) {
        URL.revokeObjectURL(cachedPdfUrl);
      }

      const pdfDataUrl = downloadPDF(documentData, signatoryDetails, currentDate, sessionDate, documentData.no, true);
      const blob = dataUrlToBlob(pdfDataUrl);
      const blobUrl = URL.createObjectURL(blob);

      // Update the cache with the new PDF URL
      setCachedPdfUrl(blobUrl);
      setLastGeneratedData(currentData);

      // Set the PDF URL for the iframe
      setPdfUrl(blobUrl);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert('Failed to generate PDF preview. Check the console for details.');
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    if (pdfUrl && pdfUrl !== cachedPdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
  };

  useEffect(() => {
    return () => {
      if (cachedPdfUrl) URL.revokeObjectURL(cachedPdfUrl);
    };
  }, [cachedPdfUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">Transmittal Sheet</h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/3 p-6 flex justify-center items-start overflow-y-auto bg-gray-50">
            <div
              ref={componentRef}
              className="bg-white w-[216mm] min-h-[330mm] relative"
              style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-[83px] h-[83px] flex items-center justify-center">
                      <img src="src/assets/Images/cdo_logo.png" alt="Cagayan de Oro Logo" />
                    </div>
                    <div className="w-[83px] h-[83px] flex items-center justify-center">
                      <img src="src/assets/Images/goldenfriendship_logo.png" alt="Golden Friendship Logo" />
                    </div>
                    <div className="w-[83px] h-[83px] flex items-center justify-center">
                      <img src="src/assets/Images/bagongpilipinas_logo.png" alt="Bagong Pilipinas Logo" />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-bold text-gray-800 uppercase">Republic of the Philippines</p>
                      <p className="text-[14px] font-bold text-gray-800 uppercase">City of Cagayan de Oro</p>
                      <p className="text-[16px] font-bold text-gray-800 uppercase">Office of the City Council</p>
                      <p className="text-[8px] text-gray-800">www.cdecitycouncil.com</p>
                    </div>
                  </div>
                  <div className="w-[83px] h-[83px] flex items-center justify-center">
                    <img src="src/assets/Images/CityC_Logo.png" alt="City Council Logo" />
                  </div>
                </div>
                <div className="w-full">
                  <div className="h-px" style={{ borderTop: '1px solid #a7897d' }}></div>
                  <div className="h-px mt-1" style={{ background: 'linear-gradient(to right, #76adb8, #3f6f8b, #123360)' }}></div>
                </div>
              </div>

              <div
                style={{
                  paddingBottom: '1.5cm',
                  paddingLeft: '3.81cm',
                  paddingRight: '2.54cm',
                }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-[16px] font-bold text-gray-800 uppercase tracking-wide">Transmittal Sheet</h1>
                  <p className="text-[15px] text-gray-600 mt-2" style={{ textIndent: '150px' }}>{currentDate}</p>
                </div>

                <div className="mb-8">
                  <p className="text-[15px] text-gray-700">Sirs/Mesdames:</p>
                  <p className="text-[15px] text-gray-700 mt-3 leading-relaxed text-justify" style={{ textIndent: '1.27cm' }}>
                    Enclosed is a copy of <span className="font-bold">{documentData.document_type || "N/A"} No. {documentData.no || "N/A"}</span>, current series, passed by the City Council of this City, during its Regular Session on the <span className="font-bold">{sessionDate.day}<sup>{sessionDate.suffix}</sup> day of {sessionDate.month} {sessionDate.year}</span>, to wit:
                  </p>
                  <div className="w-[80%] border border-gray-700 p-2 mt-4 mx-auto flex justify-center items-center">
                    <p className="text-[15px] text-gray-700 font-bold uppercase text-justify">{documentData.title || "N/A"}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[15px] text-gray-700">for your information.</p>
                </div>

                <div className="mb-8">
                  <p className="text-[15px] text-gray-700 mb-4 leading-relaxed" style={{ textIndent: '1.25cm' }}>Thank you very much.</p>
                  <div className="grid grid-cols-[1fr_2fr] gap-4">
                    <div></div>
                    <div className="text-center">
                      <p className="text-[15px] text-gray-700 mb-6">Very truly yours</p>
                      <p className="text-[15px] text-gray-700 font-bold uppercase mb-1">{signatoryDetails.name || "N/A"}</p>
                      <p className="text-[15px] text-gray-700">{signatoryDetails.title1 || "N/A"}</p>
                      <p className="text-[15px] text-gray-700">{signatoryDetails.title2 || "N/A"}</p>
                      <p className="text-[15px] text-gray-700">{signatoryDetails.authority || "N/A"}</p>
                      <p className="text-[15px] text-gray-700">{signatoryDetails.authorityTitle || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center space-x-4 mb-2 font-bold text-[15px] text-gray-700">
                    <p className="w-2/3">Office</p>
                    <p className="w-2/3 text-center">Receiver Name</p>
                    <p className="w-1/3 text-center">Signature</p>
                    <p className="w-1/3 text-center">Date</p>
                  </div>
                  {documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0 ? (
                    documentData.transmitted_recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-4 mb-2">
                        <p className="text-[12px] text-gray-700 w-2/3">{recipient.designation || "N/A"}</p>
                        <p className="text-[12px] text-gray-700 w-2/3 border-b border-gray-800 text-center"></p>
                        <p className="text-[12px] text-gray-700 w-1/3 border-b border-gray-800 text-center"></p>
                        <p className="text-[12px] text-gray-700 w-1/3 border-b border-gray-800 text-center"></p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[15px] text-gray-700 text-center">No recipients added.</p>
                  )}
                </div>

                <div className="absolute bottom-4 left-0 w-full text-right pr-[2.54cm]">
                  <p className="text-xs text-gray-500">
                    Generated from the LMIS & Records Section {new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-1/3 p-6 bg-white border-l border-gray-200 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 tracking-wide">Edit Signatory Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Name</label>
                <input
                  type="text"
                  value={signatoryDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] transition-all"
                  placeholder="Enter signatory name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Line 1)</label>
                <input
                  type="text"
                  value={signatoryDetails.title1}
                  onChange={(e) => handleInputChange('title1', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] transition-all"
                  placeholder="Enter title (line 1)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Line 2)</label>
                <input
                  type="text"
                  value={signatoryDetails.title2}
                  onChange={(e) => handleInputChange('title2', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] transition-all"
                  placeholder="Enter title (line 2)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authority</label>
                <input
                  type="text"
                  value={signatoryDetails.authority}
                  onChange={(e) => handleInputChange('authority', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] transition-all"
                  placeholder="Enter authority"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authority Title</label>
                <input
                  type="text"
                  value={signatoryDetails.authorityTitle}
                  onChange={(e) => handleInputChange('authorityTitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] transition-all"
                  placeholder="Enter authority title"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <div>
            <button
              onClick={handlePreviewPDF}
              className="p-2 text-purple-500 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              title="Preview PDF in Modal"
            >
              <PreviewIcon />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              title="Download PDF (Editable)"
            >
              <PDFIcon />
            </button>
            <button
              onClick={() => downloadDOCX(documentData, signatoryDetails, currentDate, sessionDate)}
              className="p-2 text-green-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              title="Download DOCX (Editable)"
            >
              <DOCXIcon />
            </button>
          </div>
          
          <div className='space-x-2'>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-all"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {isPreviewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-60">
            <div className="bg-white rounded-xl shadow-2xl w-[80%] h-[90vh] flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 tracking-wide">PDF Preview</h2>
                <button
                  onClick={closePreviewModal}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-6">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title="PDF Preview"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                ) : (
                  <p className="text-center text-gray-600">Loading PDF...</p>
                )}
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            @media print {
              .fixed, .bg-black, .bg-gradient-to-r, .border-t, .border-l, .border-gray-200, button {
                display: none !important;
              }
              body {
                padding: 0;
                margin: 0;
                background: white !important;
              }
              .max-w-7xl {
                max-width: none;
                width: 100%;
              }
              .p-6 {
                padding: 0 !important;
              }
              .w-1\\/3 {
                display: none !important;
              }
              .w-2\\/3 {
                width: 100% !important;
                padding: 0 !important;
                background: white !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }
              .w-2\\/3 > div {
                transform: scale(1) !important;
                width: 216mm !important;
                min-height: 330mm !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export const getTransmittalData = (rowData) => {
  return {
    no: rowData.no,
    document_type: rowData.document_type,
    title: rowData.title,
    sponsor: rowData.sponsor,
    date_transmitted: rowData.date_transmitted,
    date_approved: rowData.date_approved,
    transmitted_recipients: rowData.transmitted_recipients || [],
  };
};