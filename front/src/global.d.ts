declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

// 如果你也在使用 Less 或 Sass Modules，可以一起声明
declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.module.less' {
    const classes: { [key: string]: string };
    export default classes;
}