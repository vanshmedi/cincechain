/// <reference types="vite/client" />
/// <reference types="ethers" />

interface Window {
  ethereum?: import("ethers").Eip1193Provider & {
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
  };
}
