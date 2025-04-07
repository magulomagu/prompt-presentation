// ダウンロードユーティリティ関数
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// PDFダウンロード
export const downloadAsPDF = async (elementId, filename = 'presentation.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  const opt = {
    margin: 1,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    console.log('PDF downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// SVGダウンロード
export const downloadAsSVG = async (elementId, filename = 'presentation.svg') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    // HTML要素をSVG文字列に変換
    const svgData = new XMLSerializer().serializeToString(element);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // ダウンロードリンクを作成
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log('SVG downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error generating SVG:', error);
    return false;
  }
};

// PNGダウンロード
export const downloadAsPNG = async (elementId, filename = 'presentation.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // ダウンロードリンクを作成
    const downloadLink = document.createElement('a');
    downloadLink.href = imgData;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log('PNG downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error generating PNG:', error);
    return false;
  }
};

// 現在のスライドのみをダウンロード
export const downloadCurrentSlide = async (format, elementId, slideIndex) => {
  const filename = `slide_${slideIndex + 1}.${format}`;
  
  switch (format) {
    case 'pdf':
      return await downloadAsPDF(elementId, filename);
    case 'svg':
      return await downloadAsSVG(elementId, filename);
    case 'png':
      return await downloadAsPNG(elementId, filename);
    default:
      console.error('Unsupported format:', format);
      return false;
  }
};

// 全スライドをダウンロード（PDFのみ）
export const downloadAllSlides = async (elementId, slidesCount, title = 'presentation') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 各スライドをキャプチャしてPDFに追加
    for (let i = 0; i < slidesCount; i++) {
      // スライドを表示
      // この部分は実際の実装に合わせて調整が必要
      
      const slideElement = document.getElementById(`slide-${i}`);
      if (!slideElement) continue;
      
      const canvas = await html2canvas(slideElement, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // 最初のページ以外は新しいページを追加
      if (i > 0) {
        pdf.addPage();
      }
      
      // 画像をPDFに追加
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210); // A4横サイズ
    }
    
    // PDFを保存
    pdf.save(`${title}.pdf`);
    
    console.log('All slides downloaded as PDF successfully');
    return true;
  } catch (error) {
    console.error('Error generating PDF for all slides:', error);
    return false;
  }
};
