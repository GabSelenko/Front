import { useState, useEffect } from 'react';

export function useSharePdf() {
  const [canShareFiles, setCanShareFiles] = useState(false);

  useEffect(() => {
    try {
      if (navigator.canShare) {
        const testFile = new File([], 'test.pdf', { type: 'application/pdf' });
        setCanShareFiles(navigator.canShare({ files: [testFile] }));
      }
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  async function sharePdf(blob, fileName) {
    const file = new File([blob], fileName, { type: 'application/pdf' });
    await navigator.share({
      files: [file],
      title: fileName.replace('.pdf', ''),
    });
  }

  return { canShareFiles, sharePdf };
}
