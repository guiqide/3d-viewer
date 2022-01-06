# 3d-viewer
treejs渲染工具合集

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## typescript config
因为example与core的差异较大，并不适用使用同一个tsconfig配置文件，所以这里进行了拆分。

## core结构
core通过rollup+@rollup/plugin-typescript进行单体文件编译

## examples结构
examples通过rollup+@rollup/plugin-typescript输出单体编译后文件，通过web-dev-service+@web/dev-server-esbuild实现本地开发环境