export function transformSolutionCode(input: string) {
    let strArr: string[] = input.split("");

    for (let i = 0; i < 4; i++) {
        let ch = strArr[i];
        if (ch >= 'A' && ch <= 'Z') {
            let index = ch.charCodeAt(0) - 'A'.charCodeAt(0);
            ch = String.fromCharCode('A'.charCodeAt(0) + (25 - index));
        }
        strArr[i] = ch;
    }

    let substr1 = strArr.slice(0, 4).join("");

    return `${substr1}`;
}
