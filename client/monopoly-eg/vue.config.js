module.exports = {
    publicPath: '/',
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "productName": "Monopoly EG",
                "nsis": {
                  "uninstallDisplayName": "Monopoly EG"
                },
                win: {
                    icon: './icon.ico'
                }
            },
            chainWebpackRendererProcess: config => {
              // Chain webpack config for electron renderer process only
              // The following example will set IS_ELECTRON to true in your app
              config.plugin('define').tap(args => {
                args[0]['IS_ELECTRON'] = true
                return args
              })
            }
        }
    }
}