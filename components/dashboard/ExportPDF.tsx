"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportPDFProps {
  elementId: string;
  filename: string;
  title?: string;
  buttonLabel?: string;
}

export function ExportPDF({
  elementId,
  filename,
  title,
  buttonLabel = "Exportar PDF",
}: ExportPDFProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);

      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`[v0] Element with id "${elementId}" not found`);
        alert("No se encontró el elemento a exportar");
        return;
      }

      // Clonar elemento para no modificar el DOM
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.backgroundColor = "#ffffff";

      // Reemplazar variables CSS y colores lab() con valores hexadecimales
      const allElements = [clone, ...clone.querySelectorAll("*")] as HTMLElement[];
      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const bgColor = computed.backgroundColor;
        
        // Reemplazar colores problematicos
        if (bgColor && bgColor.includes("lab")) {
          el.style.backgroundColor = "#ffffff";
        }
        if (bgColor && bgColor.includes("transparent")) {
          el.style.backgroundColor = "transparent";
        }
      });

      // Añadir al DOM temporalmente para que html2canvas pueda capturarlo
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.appendChild(clone);
      document.body.appendChild(container);

      // Capturar elemento como canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: true,
      });

      // Limpiar DOM temporal
      document.body.removeChild(container);

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

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("[v0] PDF export error:", error);
      alert("Error al exportar PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed transition-colors text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm"
      title={title}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5" />
          {buttonLabel}
        </>
      )}
    </button>
  );
}
