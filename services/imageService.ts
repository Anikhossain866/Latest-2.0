declare const html2canvas: any;

/**
 * ULTRA-HD IMAGE EXPORT:
 * Uses Scale 5 for extreme sharpness, bypassing all PDF rendering artifacts.
 * Perfect for Bengali Unicode and professional printing.
 */
export const generateHighQualityImage = async (element: HTMLElement, filename: string): Promise<void> => {
  // 1. Prepare element: remove UI-only scaling and shadows for the snapshot
  const originalTransform = element.style.transform;
  const originalBoxShadow = element.style.boxShadow;
  
  element.style.transform = 'none';
  element.style.boxShadow = 'none';

  // Ensure fonts are fully loaded
  if ((document as any).fonts) {
    await (document as any).fonts.ready;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 5,               // Ultra-HD (5x) for maximum crispness
      useCORS: true, 
      letterRendering: false, // Prevents kerning glitches in high-res capture
      logging: false,
      backgroundColor: null,  // Set to null to capture element's background
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: element.offsetWidth,
      height: element.offsetHeight,
      onclone: (clonedDoc: Document) => {
        // Ensure the cloned element used for capture is clean
        const el = clonedDoc.getElementById('printable-a4-canvas');
        if (el) {
          el.style.transform = 'none';
          el.style.boxShadow = 'none';
        }
      }
    });

    // 2. Convert canvas to Blob and download
    const imgData = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${filename || 'Anik_Tools_Export'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Anik Tools Image Export Error:', error);
    throw error;
  } finally {
    // 3. Restore UI state
    element.style.transform = originalTransform;
    element.style.boxShadow = originalBoxShadow;
  }
};