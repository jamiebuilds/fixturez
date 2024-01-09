export = fixturez;
/**
 * @typedef {Object} Opts
 * @property {string | ReadonlyArray<string>} [glob]
 * @property {string} [root]
 * @property {boolean} [cleanup]
 */
/**
 * @param {string} cwd
 * @param {Opts} [opts]
 */
declare function fixturez(cwd: string, opts?: Opts | undefined): {
    find: (name: string) => string;
    temp: () => string;
    copy: (name: string) => string;
    cleanup: () => void;
};
declare namespace fixturez {
    export { Opts };
}
type Opts = {
    glob?: string | readonly string[] | undefined;
    root?: string | undefined;
    cleanup?: boolean | undefined;
};
