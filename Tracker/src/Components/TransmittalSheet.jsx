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
    title2: "Chief, Legislative Management Information System",
    title3: "& Records Section",
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

  const handlePrint = () => {
    try {
      // Generate PDF Blob
      const pdfBlob = downloadPDF(
        documentData,
        signatoryDetails,
        currentDate,
        sessionDate,
        documentData.no,
        false, // Not for preview
        true // For printing
      );

      // Create a URL for the Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open the PDF in a new window and trigger print
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Optionally close the window after printing
          printWindow.onafterprint = () => {
            printWindow.close();
            URL.revokeObjectURL(pdfUrl); // Clean up
            onPrint(); // Call onPrint callback
          };
        };
      } else {
        console.error('Failed to open print window.');
        alert('Please allow pop-ups to print the PDF.');
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (error) {
      console.error('Error generating PDF for print:', error);
      alert('Failed to generate PDF for printing. Check the console for details.');
    }
  };

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
  console.log('Triggering PDF download...'); // Add for debugging
  downloadPDF(documentData, signatoryDetails, currentDate, sessionDate, documentData.no);
};

  const handleDownloadDOCX = () => {
    console.log('Downloading DOCX...');
    downloadDOCX(documentData, signatoryDetails, currentDate, sessionDate);
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

    try {
      if (cachedPdfUrl) {
        URL.revokeObjectURL(cachedPdfUrl);
      }

      const pdfDataUrl = downloadPDF(documentData, signatoryDetails, currentDate, sessionDate, documentData.no, true);
      const blob = dataUrlToBlob(pdfDataUrl);
      const blobUrl = URL.createObjectURL(blob);

      setCachedPdfUrl(blobUrl);
      setLastGeneratedData(currentData);

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1500px] h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">Transmittal Sheet</h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/3 p-6 flex justify-center items-start overflow-y-auto bg-gray-50">
            <div
              ref={componentRef}
              className="bg-white w-[816px] min-h-[1247px]" // 216mm x 330mm at 96dpi
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                margin: 0,
                padding: 0,
                position: 'relative', // Add position: relative to make this the positioning context
              }}
            >
              {/* Header with Padding */}
              <div style={{ paddingTop: '20px', padding: '20px' }}>
                <div className="flex justify-between items-start mb-[10px]">
                  <div className="flex items-center">
                    <img
                      src="src/assets/Images/cdo_logo.png"
                      alt="Cagayan de Oro Logo"
                      style={{ width: '94px', height: '94px', marginRight: '10px' }}
                    />
                    <img
                      src="src/assets/Images/goldenfriendship_logo.png"
                      alt="Golden Friendship Logo"
                      style={{ width: '68px', height: '34px', marginRight: '5px' }}
                    />
                    <img
                      src="src/assets/Images/bagongpilipinas_logo.png"
                      alt="Bagong Pilipinas Logo"
                      style={{ width: '94px', height: '94px', marginRight: '10px' }}
                    />
                    <div className="text-center flex-1 mt-[10px]">
                      <p style={{ fontSize: '12.55px', color: 'rgb(55, 65, 81)' }}>
                        Republic of the Philippines
                      </p>
                      <p style={{ fontSize: '13px', color: 'rgb(55, 65, 81)' }}>
                        CITY OF CAGAYAN DE ORO
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(55, 65, 81)' }}>
                        OFFICE OF THE CITY COUNCIL
                      </p>
                      <p style={{ fontSize: '10px', color: 'rgb(107, 114, 128)' }}>
                        www.cdecitycouncil.com
                      </p>
                    </div>
                  </div>
                  <img
                    src="src/assets/Images/CityC_Logo.png"
                    alt="City Council Logo"
                    style={{ width: '94px', height: '94px', marginLeft: '15px' }}
                  />
                </div>
                <div style={{ marginBottom: '0' }}>
                  <div style={{ borderTop: '2px solid rgb(167, 137, 125)', width: '100%' }}></div>
                  <div
                    style={{
                      height: '2px',
                      background: 'linear-gradient(to right, #76adb8, #3f6f8b, #123360)',
                      marginTop: '4px',
                      width: '100%',
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ marginLeft: '144px', marginRight: '96px', marginTop: '38px' }}>
                {/* Title and Date */}
                <div className="text-center mb-[30px]">
                  <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(55, 65, 81)' }}>
                    TRANSMITTAL SHEET
                  </h1>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgb(75, 85, 99)',
                      textAlign: 'center',
                      marginTop: '19px',
                      textIndent: '150px',
                    }}
                  >
                    {currentDate}
                  </p>
                </div>

                {/* Body */}
                <div className="mb-[20px]">
                  <p style={{ fontSize: '12px', color: 'rgb(55, 65, 81)' }}>Sirs/Mesdames:</p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgb(55, 65, 81)',
                      textIndent: '38px',
                      textAlign: 'justify',
                      marginTop: '38px',
                      lineHeight: '1.5',
                    }}
                  >
                    Enclosed is a copy of{' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {documentData.document_type || "N/A"} No. {documentData.no || "N/A"}
                    </span>
                    , current series, passed by the City Council of this City
                    <span style={{ textIndent: '0' }}>
                      , during its Regular Session on the{' '}
                      <span style={{ fontWeight: 'bold' }}>
                        {sessionDate.day}
                        <span style={{ fontSize: '12px', position: 'relative', top: '-2px' }}>
                          {sessionDate.suffix}
                        </span>{' '}
                        day of {sessionDate.month} {sessionDate.year}
                      </span>
                      , to wit:
                    </span>
                  </p>
                  <div
                    style={{
                      width: '450px',
                      border: '0.38px solid rgb(55, 65, 81)',
                      padding: '11.34px',
                      margin: '19px auto',
                      textAlign: 'justify',
                      lineHeight: '1.5',
                    }}
                  >
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgb(55, 65, 81)', textTransform: 'uppercase' }}>
                      {documentData.title || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mb-[15px]">
                  <p style={{ fontSize: '12px', color: 'rgb(55, 65, 81)' }}>for your information.</p>
                </div>

                <div className="mb-[30px]">
                  <p style={{ fontSize: '12px', color: 'rgb(55, 65, 81)', textIndent: '38px', marginBottom: '15px' }}>
                    Thank you very much.
                  </p>
                  <div style={{ textAlign: 'center', marginLeft: '280px' }}>
                    <p style={{ fontSize: '12px', color: 'rgb(55, 65, 81)', marginBottom: '25px' }}>
                      Very truly yours,
                    </p>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(55, 65, 81)', textTransform: 'uppercase', marginBottom: '0px' }}>
                      {signatoryDetails.name || "N/A"}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgb(55, 65, 81)', marginBottom: '0px' }}>
                      {signatoryDetails.title1 || "N/A"}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgb(55, 65, 81)', marginBottom: '0px' }}>
                      {signatoryDetails.title2 || "N/A"}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgb(55, 65, 81)', marginBottom: '0px' }}>
                      {signatoryDetails.title3 || "N/A"}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgb(55, 65, 81)', marginBottom: '0px' }}>
                      {signatoryDetails.authority || "N/A"}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgb(55, 65, 81)' }}>
                      {signatoryDetails.authorityTitle || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Recipients Table */}
                <div className="mb-[30px]">
                  <div style={{ display: 'flex', marginBottom: '38px', marginLeft: '40px' }}>
                    <p style={{ width: '245px', fontSize: '10px', color: 'rgb(55, 65, 81)', textAlign: 'left' }}>
                      Office
                    </p>
                    <p style={{ width: '170px', fontSize: '10px', color: 'rgb(55, 65, 81)', textAlign: 'center' }}>
                      Receiver Name
                    </p>
                    <p style={{ width: '94px', fontSize: '10px', color: 'rgb(55, 65, 81)', textAlign: 'center' }}>
                      Signature
                    </p>
                    <p style={{ width: '94px', fontSize: '10px', color: 'rgb(55, 65, 81)', textAlign: 'center' }}>
                      Date
                    </p>
                  </div>
                  {documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0 ? (
                    documentData.transmitted_recipients.map((recipient, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '40px' }}>
                        <p
                          style={{
                            width: '245px',
                            fontSize: '13.33px',
                            color: 'rgb(55, 65, 81)',
                            textAlign: 'left',
                          }}
                        >
                          {recipient.designation || "N/A"}
                        </p>
                        <div style={{ width: '161px', textAlign: 'center' }}>
                          <div style={{ borderBottom: '0.38px solid black', width: '150px', margin: '0 auto' }}></div>
                        </div>
                        <div style={{ width: '94px', textAlign: 'center' }}>
                          <div style={{ borderBottom: '0.38px solid black', width: '60px', margin: '0 auto' }}></div>
                        </div>
                        <div style={{ width: '94px', textAlign: 'center' }}>
                          <div style={{ borderBottom: '0.38px solid black', width: '60px', margin: '0 auto' }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '10px', color: 'rgb(55, 65, 81)', textAlign: 'center' }}>
                      No recipients added.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ position: 'absolute', bottom: '20px', right: '96px' }}>
                <p style={{ fontSize: '12px', color: 'rgb(107, 114, 128)', textAlign: 'right' }}>
                  Generated from the LMIS & Records Section{' '}
                  {new Date().toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}
                </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Line 3)</label>
                <input
                  type="text"
                  value={signatoryDetails.title3}
                  onChange={(e) => handleInputChange('title3', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#408286] focus:border-[#408286] transition-all"
                  placeholder="Enter title (line 3)"
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
            onClick={handleDownloadPDF} // This must call handleDownloadPDF
            className="p-2 text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            title="Download PDF (Editable)"
          >
            <PDFIcon />
          </button>
          <button
            onClick={() => downloadDOCX(documentData, signatoryDetails, currentDate, sessionDate)} // This calls downloadDOCX
            className="p-2 text-green-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            title="Download DOCX (Editable)"
          >
            <DOCXIcon />
          </button>
        </div>
          
          <div className='space-x-2'>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#408286] text-white rounded-lg hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-[#408286] transition-all shadow-md font-poppins text-sm"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all shadow-md font-poppins text-sm"
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
                width: 750px !important; /* Updated to match the component width */
                min-height: 1247px !important;
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