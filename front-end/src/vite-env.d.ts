/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  // adicione mais variáveis de ambiente aqui se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}