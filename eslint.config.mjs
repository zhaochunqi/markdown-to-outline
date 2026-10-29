import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**', 'public/sw.js'],
  },
  ...nextCoreWebVitals,
];

export default config;
