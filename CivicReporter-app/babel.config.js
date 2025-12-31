module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove console logs in production
      process.env.NODE_ENV === 'production' && [
        'transform-remove-console',
        {
          exclude: ['error'], // Keep console.error for crash reporting
        },
      ],
    ].filter(Boolean),
  };
};
