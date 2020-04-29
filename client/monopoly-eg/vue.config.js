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
            }
        }
    }
}