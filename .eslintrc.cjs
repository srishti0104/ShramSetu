module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '19.2',
    },
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  
  // Global overrides
  overrides: [
    // Lambda functions (CommonJS, Node.js environment)
    {
      files: ['lambda/**/*.js'],
      env: {
        node: true,
        es2021: true,
      },
      parserOptions: {
        sourceType: 'script', // CommonJS
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
      rules: {
        'no-undef': 'error',
        'no-unused-vars': ['warn', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }],
      },
    },
    
    // Frontend source files (ES modules, Browser + Node)
    {
      files: ['src/**/*.{js,jsx}'],
      env: {
        browser: true,
        es2021: true,
        node: true, // For process.env
      },
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        process: 'readonly', // For Vite env vars
      },
      rules: {
        'react-refresh/only-export-components': ['warn', { 
          allowConstantExport: true,
          allowExportNames: ['useAuth', 'useOnboarding'],
        }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'no-unused-vars': ['warn', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }],
      },
    },
    
    // Infrastructure files (TypeScript)
    {
      files: ['infrastructure/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
      },
      env: {
        node: true,
      },
    },
  ],
  
  rules: {
    // General rules
    'no-console': 'off', // Allow console for debugging
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // React rules
    'react/prop-types': 'off', // Using JSDoc instead
    'react/react-in-jsx-scope': 'off', // Not needed in React 19
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    '*.config.js',
    '*.config.cjs',
    'coverage',
    '.kiro',
  ],
};
