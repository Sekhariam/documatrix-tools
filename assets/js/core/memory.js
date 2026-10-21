/**
 * Object URL & Blob Lifecycle Manager: Prevents memory leaks by revoking
 * temporary URL allocations upon unmount or replacement.
 */
class MemoryManager {
  constructor() {
    this.activeUrls = new Set();
  }

  createUrl(blob) {
    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    return url;
  }

  revokeUrl(url) {
    if (this.activeUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.activeUrls.delete(url);
    }
  }

  clearAll() {
    for (const url of this.activeUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeUrls.clear();
  }

  downloadFile(blob, filename) {
    const url = this.createUrl(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    // Asynchronous revocation after browser dispatches download pipeline
    setTimeout(() => this.revokeUrl(url), 2000);
  }
}

export const Memory = new MemoryManager();