module.exports = {
    publicPath: '/',
    configureWebpack: config => {
        return {
            plugins: [
                new webpack.DefinePlugin({
                'APPLICATION_VERSION': JSON.stringify(require('./package.json').version),
                })
            ]
        }
    },
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
            }
        }
    }
}