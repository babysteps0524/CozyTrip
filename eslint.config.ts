import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  { ignores: ['**/*.astro', '.astro/**', 'dist/**', 'node_modules/**'] },
  ...eslintPluginAstro.configs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // 필요한 커스텀 규칙이 있다면 여기에 작성
      // 1. 사용하지 않는 변수 경고 (언더스코어 _로 시작하는 변수는 예외)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // 2. any 타입 사용 시 경고 (strict하게 관리하려면 'error')
      '@typescript-eslint/no-explicit-any': 'warn',

      // 3. console.log 남아있는 것 경고 (warn/error 대신 console.warn, console.error는 허용)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // 4. const 사용 권장 (재할당 안 되는 let 경고)
      'prefer-const': 'error',

      // 5. == 대신 === 사용 강제
      eqeqeq: ['error', 'always'],

      // 6. Astro 전용: set:html 디렉티브 관련 경고 제어
      'astro/no-set-html-directive': 'error',
    },
  },
);
