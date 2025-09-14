export function numberToWords(number: number) {
    if (number == 0) { return "zero"; }
    if (number < 0) { return "minus " + numberToWords(Math.abs(number)); }
    let words = "";
    if (Math.floor(number / 10000000) > 0) { words += numberToWords(number / 10000000) + " Crore "; number %= 10000000; }
    if (Math.floor(number / 100000) > 0) { words += numberToWords(number / 100000) + " Lakh "; number %= 100000; }
    if (Math.floor(number / 1000) > 0) { words += numberToWords(number / 1000) + " Thousand "; number %= 1000; }
    if (Math.floor(number / 100) > 0) { words += numberToWords(number / 100) + " Hundred "; number %= 100; }
    if (number > 0) {
        if (words != "") { words += "and "; }
        var unitsMap = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        var tensMap = ["Zero", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "seventy", "Eighty", "Ninety"];
        if (number < 20) { words += unitsMap[number]; }
        else { words += tensMap[number / 10]; if ((number % 10) > 0) { words += "-" + unitsMap[number % 10]; } }
    }
    return words;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
  