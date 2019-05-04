import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/index.js', // Path relative to package.json
    output: {
        name: 'ForgeVuer',
        exports: 'named',
    },
    plugins: [
        // babel({
        //     plugins: ['transform-class-properties'],
        // }),
        commonjs(),
        vue({
            css: true, // Dynamically inject css as a <style> tag
            compileTemplate: true, // Explicitly convert template to render function
        }),

        buble({
            transforms:{
                asyncAwait: false,
            }
        }), // Transpile to ES5
        terser()
    ],
};