export default function (api) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      [
        'react-native-unistyles/plugin',
        {
          root: 'src',
        },
      ],
      'react-native-worklets/plugin',
    ],
    // nativewind/babel (react-native-css's import-rewriting plugin) rewrites
    // any `import ... from 'react-native-web'` (including relative imports
    // that resolve into that package) into react-native-css's own wrapped
    // components. Applied without exclusion, it also transforms
    // react-native-web's own internal files, redirecting react-native-web's
    // internal `View` import back into react-native-css's `View`, which
    // itself imports `react-native` (-> react-native-web again) — a
    // circular import that throws "Cannot read properties of undefined
    // (reading 'default')" at runtime on web. Scope the preset to app code
    // only so react-native-web's own source is never rewritten.
    // overrides: [
    //   {
    //     exclude: (filename) =>
    //       typeof filename === 'string' &&
    //       filename.includes('/react-native-web/'),
    //     presets: ['nativewind/babel'],
    //   },
    // ],
  }
}
