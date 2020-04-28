'use strict'

// @ts-check

const path = require('path')

const NUMBER_LINE = /^1\.\.\d+$/
const FAIL_LINE = /^# fail  \d+$/

exports.collect = collect
exports.strip = strip
exports.trimPrefix = trimPrefix

/**
 * @param {(a: string) => void} fn
 */
function collect (fn) {
    /** @type {string[]} */
    const total = []
    let almostFinished = false


    return report

    /**
     * @param {string} line
     */
    function report(line) {
        total.push(line)
        if (line && NUMBER_LINE.test(line)) {
            almostFinished = true
        } else if (almostFinished && (
            line === '# ok' ||
            FAIL_LINE.test(line)
        )){
            fn(strip(total.join('\n')))
        }
    }
}

/**
 * @param {string} line
 */
function strip (line) {
    var withoutTestDir = line.replace(
        new RegExp(__dirname, 'g'), '$TEST'
    );
    var withoutPackageDir = withoutTestDir.replace(
        new RegExp(path.dirname(__dirname), 'g'), '$TAPE'
    );
    var withoutPathSep = withoutPackageDir.replace(
        new RegExp('\\' + path.sep, 'g'), '/'
    );
    var withoutLineNumbers = withoutPathSep.replace(
        /:\d+:\d+/g, ':$LINE:$COL'
    ).replace(
        /:\d+/g, ':$LINE'
    );
    var withoutNestedLineNumbers = withoutLineNumbers.replace(
        /, \<anonymous\>:\$LINE:\$COL\)$/, ')'
    );
    return withoutNestedLineNumbers;
}

/**
 * @param {TemplateStringsArray} text
 */
function trimPrefix (text) {
    const lines = text[0].split('\n')
    let commonPrefix = Infinity
    for (const line of lines) {
        if (line === '' || line.trim() === '') continue
        const prefix = line.search(/\S|$/)
        if (prefix < commonPrefix) {
            commonPrefix = prefix
        }
    }

    let result = []
    for (const line of lines) {
        result.push(line.slice(commonPrefix))
    }

    return result.join('\n').trim()
}