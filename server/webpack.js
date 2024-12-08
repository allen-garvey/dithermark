import path from 'path';
import webpack from 'webpack';

export const createWebpackCompiler = (fs, config) => {
    const compiler = webpack(config);
    compiler.outputFileSystem = fs;
    compiler.outputFileSystem.join = path.join.bind(path);
    return compiler;
};
