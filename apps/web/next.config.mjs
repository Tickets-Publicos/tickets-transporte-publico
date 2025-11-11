/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  // Desabilita telemetria em produção
  experimental: {
    disableOptimizedLoading: false,
  },

  // Otimizações de build
  compiler: {
    // Remove console.log em produção (mantém error e warn)
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },

  // Configurações de produção
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // Compressão
  compress: true,
};

export default nextConfig;
