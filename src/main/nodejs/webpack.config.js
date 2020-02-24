
var path = require('path');
module.exports = {
    entry: './src/index.js',
    target: "web",
    output: {
        path: path.resolve(__dirname, '../resources/js'),
        filename: 'TreeMindMap.js',
        library:'TreeMindMapLibrary',
        libraryTarget: 'var'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
            {
                test: /\.css/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        },
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                    },
                },
            },
        ]
    }

};