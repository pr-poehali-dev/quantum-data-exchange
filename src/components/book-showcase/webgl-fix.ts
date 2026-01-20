export function applyWebGLFix() {
  if (typeof window === 'undefined') return;

  const originalCreateElement = document.createElement.bind(document);
  
  document.createElement = function(tagName: string, options?: any) {
    const element = originalCreateElement(tagName, options);
    
    if (tagName.toLowerCase() === 'canvas') {
      try {
        Object.defineProperty(element, 'pp', {
          value: undefined,
          writable: false,
          configurable: false,
          enumerable: false
        });
      } catch (e) {
      }
    }
    
    return element;
  } as any;

  const canvases = document.getElementsByTagName('canvas');
  for (let i = 0; i < canvases.length; i++) {
    try {
      const canvas = canvases[i];
      if (canvas.hasOwnProperty('pp')) {
        delete (canvas as any).pp;
      }
    } catch (e) {
    }
  }
}
