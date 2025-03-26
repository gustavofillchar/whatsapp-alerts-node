declare module 'qrcode-terminal' {
  interface QRCodeOptions {
    small?: boolean;
  }
  function generate(text: string, options?: QRCodeOptions): void;
  function setErrorLevel(error: string): void;
  
  export = {
    generate,
    setErrorLevel
  };
} 