export const transformMachineCode = (input?: string): string => {
    if (!input) {
        return ""; 
    }

    let result = "";

    for (let i = 0; i < 4 && i < input.length; i++) {
        let ch = input[i];

        if (ch >= "A" && ch <= "Z") {
            const index = ch.charCodeAt(0) - "A".charCodeAt(0);
            ch = String.fromCharCode("A".charCodeAt(0) + (25 - index));
        }

        result += ch;
    }

    const substr1 = input.substring(4, input.length);

    return `${result}_${substr1}`;
};
