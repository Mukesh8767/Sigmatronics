export const transformMachineCode=(input:String)=> {
    let str = input.split(""); 

    for (let i = 0; i < 4; i++) {
        let ch = str[i];
        if(ch>='A' && ch<='Z'){
            let index = ch.charCodeAt(0) - 'A'.charCodeAt(0);
            ch = String.fromCharCode('A'.charCodeAt(0) + (25 - index));
    }
        str[i] = ch;
    }

    let substr1 = str.slice(0, 4).join("");
    let substr2 = str.slice(4).join("");

    return `${substr1}_${substr2}`;
}



