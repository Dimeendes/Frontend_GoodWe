/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false
  },
  // Configurações para melhorar performance no Windows
  webpack: (config, { isServer }) => {
    // Configuração para evitar problemas com caminhos longos no Windows
    config.resolve.symlinks = false;
    
    // Configuração de cache para Windows
    if (!isServer) {
      config.cache = {
        type: 'memory'
      };
    }
    
    return config;
  },
  // Configurações adicionais para Windows
  outputFileTracing: false,
  swcMinify: true
};

module.exports = nextConfig;

