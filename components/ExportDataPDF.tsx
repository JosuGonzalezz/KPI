"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportDataPDFProps {
  year: number;
  month: number;
  day: number;
  buttonLabel?: string;
}

export function ExportDataPDF({
  year,
  month,
  day,
  buttonLabel = "Exportar Datos a PDF",
}: ExportDataPDFProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Obtener el HTML desde el API
      const response = await fetch("/api/export-pdf?type=data");
      if (!response.ok) throw new Error("Failed to fetch PDF content");

      const htmlContent = await response.text();

      // Crear un div temporal con el contenido
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.padding = "20px";
      tempDiv.style.backgroundColor = "#ffffff";

      // Reemplazar variables CSS y colores lab() con valores hexadecimales
      const allElements = [tempDiv, ...tempDiv.querySelectorAll("*")] as HTMLElement[];
      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const bgColor = computed.backgroundColor;
        
        if (bgColor && bgColor.includes("lab")) {
          el.style.backgroundColor = "#ffffff";
        }
        if (bgColor && bgColor.includes("transparent")) {
          el.style.backgroundColor = "transparent";
        }
      });

      document.body.appendChild(tempDiv);

      // Capturar como canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: true,
      });

      // Eliminar div temporal
      document.body.removeChild(tempDiv);

      // Crear PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      pdf.save(`reporte-datos-${day}-${month}-${year}.pdf`);
    } catch (error) {
      console.error("[v0] Data PDF export error:", error);
      alert("Error al exportar PDF. Verifica la consola.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed transition-colors text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          {buttonLabel}
        </>
      )}
    </button>
  );
}
