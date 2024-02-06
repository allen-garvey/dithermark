// from: https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
// will be false positive on IE11 or if user agent is spoofed, but is not a big deal,
// since IE11 is not supported anyway.
export function isiOs() {
    const iOsRegex = /iP(ad|hone|od)/;
    return (
        iOsRegex.test(navigator.userAgent) ||
        (navigator.platform && iOsRegex.test(navigator.platform))
    );
}
