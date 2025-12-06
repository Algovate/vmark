/**
 * Creates and triggers a file input dialog
 */
export function triggerFileInput(
  options: {
    multiple?: boolean;
    accept?: string;
    onSelect: (files: File[]) => void;
  }
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = options.multiple ?? false;
  input.accept = options.accept ?? '*/*';
  
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      options.onSelect(Array.from(files));
    }
  };
  
  input.click();
}

