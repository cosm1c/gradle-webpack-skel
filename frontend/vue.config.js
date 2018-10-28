module.exports = {
  pwa: {
    themeColor: '#2b5797'
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  }
};
