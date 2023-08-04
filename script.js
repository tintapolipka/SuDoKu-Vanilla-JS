// New table data:
// base parameters:
const negyzetMeret = 3; //MIN 2 MAX 3!
const sorHossz = negyzetMeret * negyzetMeret;
const squareMap = allSquareLister();

//const teljesTabla = [];
let teljesTabla = [];

// general functions
function rng(int) {
  return Math.floor(Math.random() * int) + 1;
}

// Első sor/ random sorrend genetátor
function randomRow() {
  let arrToReturn = [];
  let arrToSplice = [];

  for (let i = 0; i < sorHossz; i++) {
    arrToSplice[i] = i + 1;
  }

  for (let j = 0; j < sorHossz; j++) {
    let rngNumber = rng(arrToSplice.length) - 1;
    let [numberToSave] = arrToSplice.splice(rngNumber, 1);
    arrToReturn.push(numberToSave);
  }
  return arrToReturn;
}

// Oszlop ellenőrző funkció
function allowedInColumn(testNr, index) {
  let toReturn = true;
  let k = 0;
  while (toReturn && k < teljesTabla.length) {
    toReturn = teljesTabla[k][index] !== testNr;
    k++;
  }
  return toReturn;
}

function allowedInSquare(rowIndex, columnIndex, testNr) {
  function getSquare(rowIndex, columnIndex) {
    let index = rowIndex * sorHossz + columnIndex;
    return index;
  }
  const k = getSquare(rowIndex, columnIndex);
  const groupIndex =
    (Math.floor(k / negyzetMeret) % negyzetMeret) +
    Math.floor(k / negyzetMeret / sorHossz) * negyzetMeret;

  let countFalse = 0;
  function callBackFn(item) {
    let itemToTest = teljesTabla[item[0]] ? teljesTabla[item[0]][item[1]] : 0;
    countFalse += itemToTest !== testNr ? 0 : 1;
    console.log("countFalse: ", countFalse);
  }
  squareMap[groupIndex].forEach(callBackFn);

  return countFalse > 0 ? false : true;
}

function teljesTablaGenerator() {
  teljesTabla[0] = randomRow();

  for (let i = 1; i < sorHossz; i++) {
    //új sor hozzáadása a sudoku táblához:
    teljesTabla.push([]);

    // az alapanyag elkészítése (randomizált sor)
    let numLeftArr = randomRow();

    // az új soron végigiterálás, annak feltöltése egyesével:
    for (let j = 0; j < sorHossz; j++) {
      let rowIndex = teljesTabla.length - 1;
      let columnIndex = sorHossz - numLeftArr.length;
      // A számok végigpróbálgatása, amíg nem találunk megfelelőt:
      let biztonsagiSzamlalo = 20;
      while (
        columnIndex === sorHossz - numLeftArr.length &&
        0 < biztonsagiSzamlalo
      ) {
        biztonsagiSzamlalo--;
        if (biztonsagiSzamlalo == 1) {
          console.log("Mindjárt lejár a számláló!");
        }
        let testNr = numLeftArr.shift();
        console.log("testNr", testNr);
        if (
          allowedInColumn(testNr, columnIndex) &&
          allowedInSquare(rowIndex, columnIndex, testNr)
        ) {
          teljesTabla[rowIndex][columnIndex] = testNr;
          console.log(i, ". sor", j, ". oszlop: ", testNr, " lett");
        } else {
          numLeftArr.push(testNr);
          console.log("testNr- ", testNr, "Nem volt jó.");
        }
        console.log(numLeftArr);
      }
    }
    if (teljesTabla[teljesTabla.length - 1].length < sorHossz) {
      console.log("AZ " + i + ".dik SOR ZSÁKUTCA, KEZDJÜK ÚJRA!");
      teljesTabla.pop();
      i--;
    }
  }
}

// Teszthez:
const probaSudoku = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

// Négyzet ellenőrző funkció:

/* az allSquareLister() felsorolja egy tömbben rendre az azonos négyzetbe tartozó
    négyzetek koordinátáit a teljesTabla-ban: első paraméter (sor száma) a 
    legfelső tömbben az indexe, a második (oszlop száma) a beágyazott tömbben az indexe  */
function allSquareLister() {
  let everySquare = [];
  // negyzetMeret*negyzetMeret elem legyen benne a legmagasabb szinten:
  for (let i = 0; i < negyzetMeret * negyzetMeret; i++) {
    everySquare[i] = [];
  }
  // minden elemhez kell a kezdő sortól  kezdő sor + negyzetMeret.-ig tartó sorok
  for (let k = 0; k < sorHossz * sorHossz; k++) {
    const groupIndex =
      (Math.floor(k / negyzetMeret) % negyzetMeret) +
      Math.floor(k / negyzetMeret / sorHossz) * negyzetMeret;

    everySquare[groupIndex].push([Math.floor(k / sorHossz), k % sorHossz]);
  }

  return everySquare;
}

// Printing functions
function id(idName) {
  return document.getElementById(idName);
}

function renderer() {
  const sideLength = 45;

  id("root").innerHTML += `<style>#root{width:${sorHossz * sideLength}px} 
.sudokuCell{ width: ${sideLength}px; height: ${sideLength}px; } 
.sudokuCell:nth-of-type(${negyzetMeret}n){border-right: 4px solid black;}
</style>`;
  for (let i = 0; i < sorHossz * sorHossz; i++) {
    id("root").innerHTML += `
<div id="id${i}" class="sudokuCell">${i}</div>
${
  i >
    Math.floor(i / (negyzetMeret * sorHossz)) * (sorHossz * negyzetMeret) +
      sorHossz * negyzetMeret -
      sorHossz -
      1 &&
  i <
    Math.floor(i / (negyzetMeret * sorHossz)) * (sorHossz * negyzetMeret) +
      sorHossz * negyzetMeret
    ? `<style>#id${i}{border-bottom: 4px solid black;}</style>`
    : ""
}

`;
  }
}

function dataFiller() {
  teljesTablaGenerator();
  teljesTabla.flat().forEach((item, index) => {
    id(`id${index}`).innerText = item;
  });
  emptier();
}

function emptier() {
  let removedNumbers = [];
  for (let i = 0; i < sorHossz; i++) {
    removedNumbers.push([]);
  }
  const flatTable = teljesTabla.flat();
  for (let i = 0; i < Math.trunc((sorHossz * sorHossz) / 1.3); i++) {
    let rngNr = rng(sorHossz * sorHossz - 1);
    let numberToStore = flatTable[rngNr];
    // If-check-et, hogy mennyi van már abból a számból a store-ban!
    if (flatTable[rngNr] && removedNumbers[numberToStore - 1].length < sorHossz - negyzetMeret) {
      removedNumbers[numberToStore - 1].push(numberToStore);
      id(`id${rngNr}`).innerHTML = '<input type="text" />';
      flatTable[rngNr] = false;
    }
  }
  console.log("removedNumbers", removedNumbers);
}

function validator(){
  let vegsoEredmeny = teljesTabla.flat();
  let hibaSzam = 0;
  for(let i =0; i<vegsoEredmeny.length; i++){
    let numToCompare = id(`id${i}`).firstElementChild ? id(`id${i}`).firstElementChild.value : id(`id${i}`).textContent;
    
    if(numToCompare == vegsoEredmeny[i]){id(`id${i}`).textContent = numToCompare;} else {hibaSzam++};

  }
  console.log('hibaSzam: ', hibaSzam)

}


// TESZT:
renderer(); dataFiller();
