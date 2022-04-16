const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}

const plugins = [
  new CopyPlugin({
    patterns: [
      { from: path.resolve(__dirname, 'ui', 'public') },
    ],
  }),
];

module.exports = {
  pages: {
    index: {
      entry: 'ui/src/main.js',
    }
  },
  configureWebpack: {
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        '@': resolveSrc('ui/src'),
        src: resolveSrc('ui/src'),
        assets: resolveSrc('ui/src/assets'),
      },
    },
    plugins,
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  css: {
    // Enable CSS source maps.
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: ['./node_modules', './ui/src/assets'],
        },
      },
    },
  },
  pages: {
    index: {
      // entry for the page
      entry: 'ui/src/main.js',
      // the source template
      template: 'ui/public/index.html',
      // output as dist/index.html
      filename: 'index.html',
    },
  },
  outputDir: resolveSrc('./ui/dist')
};
