const webpack = require('webpack')
module.exports = {
  // css: {
  //     extract:false,//css分离 生产环境下是 true，开发环境下是 false
  //     modules: true, //开启css模块化
  //     loaderOptions:{//向 CSS 相关的 loader 传递选项
  //       css: {
  //         // 这里的选项会传递给 css-loader
  //       },
  //       postcss: {
  //         // 这里的选项会传递给 postcss-loader
  //       }
  //     }
  //   },
  devServer: {
      // open: process.platform === 'darwin',
      // host: '0.0.0.0',
      // port: 8001,
      // https: false,
      // hotOnly: false,
      // proxy: null, // string | Object
      // before: app => {}
      open: true,
      // proxy: 'http://localhost:3000' //告诉服务器,没有匹配到静态资源是]时,服务器代理到3000
    },
  lintOnSave: true, //关闭esling警告,
  //lintOnSave: process.env.NODE_ENV !== 'production', //生产构建时禁用
  productionSourceMap: false, //打包不携带map文件
  configureWebpack:{
    plugins:[
      new webpack.ProvidePlugin({
        jQuery:'jquery',
        $:'jquery'
      })
    ]
  }
}