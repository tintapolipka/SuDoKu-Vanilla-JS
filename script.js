// New table data:
// base parameters:
const negyzetMeret = 3; //MIN 2 MAX 3!
const sorHossz = negyzetMeret * negyzetMeret;
const squareMap = allSquareLister();

// teljesTabla = [];
let teljesTabla = [];
let teljesTablaFlat;

// play control:
let helpActive = false;
function helpActiveToggler() {
  console.log("helpActive: ", helpActive ? "false" : "true");
  helpActive = helpActive ? false : true;
  id('help-button').textContent = helpActive ? "Súgó kikapcsolása" : "Súgó bekapcsolása"
  if(helpActive){setEveryPlaceHolders()} else {
    const allTextArea = getAllTextAreasOnBoard();
    allTextArea.forEach((textarea)=>{textarea.placeholder = '';})
  }
}

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
    //console.log("countFalse: ", countFalse);
  }
  squareMap[groupIndex].forEach(callBackFn);

  return countFalse > 0 ? false : true;
}

function teljesTablaGenerator() {
  teljesTabla = [];
  teljesTabla[0] = randomRow();
  let lefagyasVizsgalo = 0;
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
        //console.log("testNr", testNr);
        if (
          allowedInColumn(testNr, columnIndex) &&
          allowedInSquare(rowIndex, columnIndex, testNr)
        ) {
          teljesTabla[rowIndex][columnIndex] = testNr;
          console.log(i, ". sor", j, ". oszlop: ", testNr, " lett");
          //lefagyasVizsgalo =0;
        } else {
          numLeftArr.push(testNr);
          //console.log("testNr- ", testNr, "Nem volt jó.");
        }
        //console.log(numLeftArr);
        //console.log("biztonsagiSzamlalo: ", biztonsagiSzamlalo);
      }
    }
    if (teljesTabla[teljesTabla.length - 1].length < sorHossz) {
      console.warn("AZ " + i + ".dik SOR ZSÁKUTCA, KEZDJÜK ÚJRA!");
      teljesTabla.pop();
      i--;
      lefagyasVizsgalo++;
      console.error("Lefagyás vizsgáló: " + lefagyasVizsgalo);
      if (lefagyasVizsgalo > 25) {
        //alert("Ez besült!");
        lefagyasVizsgalo = 0;
        return false;
      }
    }
  }
  return true;
}

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

// Rendering variables:
const board = '<div id="board"></div>';
const header = `<header>
  <h1># SuDoKu</h1>
  <p>JavaScript v01</p>
</header>`;

const controls = `<div id="controls">
<button onclick="validator()">Válaszok ellenőrzése</button>
<button id="help-button" onclick="helpActiveToggler()">Súgó bekapcsolása</button>
<button onclick="document.getElementById('how-to-play').showModal()">Szabályok</button>
</div>`;

const game = `<div id="gameDiv">${board + controls}</div>`;

const newGameButton = `<button onclick="location.reload()">Új játékot szeretnék!</button>`;

const footer = `<div id="footer"><h3>Máté Zoltán Géza (2023)</h3></div>`;
const modal = `<dialog id="how-to-play">
<h2>Mi a Sudoku?</h2>
<p>A Sudoku egy 9 × 9 cellából álló rács. A rács kilenc kisebb, 3 × 3-as blokkra oszlik, amelyben
elszórva néhány 1-től 9-ig terjedő számot találunk. Az üresen maradt cellákat a játékosok töltik
ki saját (ugyancsak 1-től 9-ig terjedő) számaikkal úgy, hogy minden vízszintes sorban, függőleges
oszlopban, és 3 × 3-as blokkban az 1-től 9-ig terjedő számok pontosan egyszer szerepeljenek.</p>
<h2>Mik ezek a gombok?</h2>
<p>A <button>Válaszok ellenőrzése</button> gomb megnyomásával a helyesen beírt számok háttere megváltozik, a helyteleneké azonban fehér marad.</p>
<p>A <button>Súgó bekapcsolása</button> gomb megjeleníti a lehetséges lépéseket. Újbóli megnyomásával a lehetséges számok eltüntethetők.</p>
<h2>Hogyan nyerhetek?</h2>
<p>Be kell írnod minden számot a helyére. Amikor az utolsó üres mezőt is kitöltötted nyertél. A táblák random generáltak, ezért lehetséges, hogy nem lesz több egyértelmű lépés. Ekkor a játék automatikusan segíteni fog.</p>
<button onclick="document.getElementById('how-to-play').close()">Értem már!</button></dialog>`;

function renderer() {
  const SideLengthDerivedFromClientWidth = Math.trunc(
    document.body.clientWidth / sorHossz
  );
  const sideLength =
    SideLengthDerivedFromClientWidth < 50
      ? SideLengthDerivedFromClientWidth
      : 50;

  id("root").innerHTML += header + game+ footer + modal;

  id("board").innerHTML += `<style>#board{width:${sorHossz * sideLength}px} 
.sudokuCell{ width: ${sideLength}px; height: ${sideLength}px; } 
.sudokuCell:nth-of-type(${negyzetMeret}n){border-right: 4px solid black;}
</style>`;
  for (let i = 0; i < sorHossz * sorHossz; i++) {
    id("board").innerHTML += `
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
  while (!teljesTablaGenerator()) {
    console.warn("Nem jó tábla, próbáljuk újra!");
  }

  teljesTablaFlat = teljesTabla.flat();
  teljesTablaFlat.forEach((item, index) => {
    id(`id${index}`).innerText = item;
  });
  emptier();
}

function emptier() {
  let removedNumbers = [];
  let numbersLeftInSquares = [];
  for (let i = 0; i < sorHossz; i++) {
    removedNumbers.push([]);
    numbersLeftInSquares.push([]);
  }

  function witchSquare(index) {
    return (
      (Math.floor(index / negyzetMeret) % negyzetMeret) +
      Math.floor(index / negyzetMeret / sorHossz) * negyzetMeret
    );
  }

  const flatTable = [...teljesTablaFlat];
  for (let i = 0; i < Math.trunc((sorHossz * sorHossz) / 1.1); i++) {
    let rngNr = rng(sorHossz * sorHossz - 1);
    let numberToStore = flatTable[rngNr];
    // If-check-et, hogy mennyi van már abból a számból a store-ban!

    let blockNr = witchSquare(rngNr);

    if (
      flatTable[rngNr] &&
      removedNumbers[numberToStore - 1].length < sorHossz - negyzetMeret &&
      numbersLeftInSquares[blockNr].length < sorHossz - negyzetMeret
    ) {
      removedNumbers[numberToStore - 1].push(numberToStore);

      numbersLeftInSquares[blockNr].push(rngNr);

      id(
        `id${rngNr}`
      ).innerHTML = `<textarea cols="1" rows="1" onblur="onBlurFunction(${rngNr})"></textarea>`;
      flatTable[rngNr] = false;
    }
  }

  //Math.floor(index/sorHossz) - sor száma
  //index%sorHossz - oszlop száma
}

// Súgó funkciók:
// Cella információ kinyerő funkció:
function cellContentNr(index) {
  return id(`id${index}`).firstElementChild
    ? +id(`id${index}`).firstElementChild.value
    : +id(`id${index}`).textContent;
}

/* sor ellenőrző funkció: 
  Az indexet fogadja, és az alapján visszadja azokat a számokat, amik nem szerepelnek még*/
function numbersLeftInThisRow(index) {
  let allnumbers = [];
  for (let i = 0; i < sorHossz; i++) {
    allnumbers.push(i + 1);
  }
  // a vizsgálat kezdő négyzete
  let firstCell = Math.floor(index / sorHossz) * sorHossz;

  for (let j = firstCell; j < firstCell + sorHossz; j++) {
    let numToCompare = cellContentNr(j);

    let indexOfNumToDelete = allnumbers.indexOf(+numToCompare);

    if (indexOfNumToDelete !== -1) {
      allnumbers.splice(indexOfNumToDelete, 1);
    }
  }
  return allnumbers;
}

function numbersLeftInColumn(index, arrayOfNumbersLeft) {
  let arrToReturn = arrayOfNumbersLeft;
  let firstIncolumn = index % sorHossz;
  for (let i = firstIncolumn; i < sorHossz * sorHossz; i += sorHossz) {
    if (arrToReturn.length > 0) {
      //kiszervezhető kód: index és maradék array fogadásával, maradék array kimenettel
      let numToCompare = cellContentNr(i);
      let indexOfNumToDelete = arrToReturn.indexOf(+numToCompare);

      if (indexOfNumToDelete !== -1) {
        arrToReturn.splice(indexOfNumToDelete, 1);
      }
    }
  }
  return arrToReturn;
}

function numberLeftInThisSquare(index, testArray) {
  let arrToReturn = testArray;

  const groupIndex =
    (Math.floor(index / negyzetMeret) % negyzetMeret) +
    Math.floor(index / negyzetMeret / sorHossz) * negyzetMeret;

  for (let i = 0; i < sorHossz; i++) {
    const index =
      squareMap[groupIndex][i][0] * sorHossz + squareMap[groupIndex][i][1];
    //kiszervezhető kód: index és maradék array fogadásával, maradék array kimenettel
    let numToCompare = cellContentNr(index);
    let indexOfNumToDelete = arrToReturn.indexOf(+numToCompare);

    if (indexOfNumToDelete !== -1) {
      arrToReturn.splice(indexOfNumToDelete, 1);
    }
  }

  return arrToReturn;
}

// placeholder beillesztő funkció, ami az indexet, majd a string formátumú placeholdert fogadja
function setPlaceHolder(index, placeHolderText = "123456") {
  if (id(`id${index}`).firstElementChild) {
    id(`id${index}`).firstElementChild.placeholder = placeHolderText;
    //A maradék lépések számolásához
    return 1;
  }
  return 0;
}
// minden placeholdert beállít
function setEveryPlaceHolders() {
  //számolja, hogy befulladt-e a játék
  let obviousMoves = 0;
  for (let i = 0; i < sorHossz * sorHossz; i++) {
    if (id(`id${i}`).firstElementChild) {
      let array = numberLeftInThisSquare(
        i,
        numbersLeftInColumn(i, numbersLeftInThisRow(i))
      );
      if (helpActive) {
        setPlaceHolder(i, array);
      }
      if (array.length === 1) {
        obviousMoves++;
      }
    }
  }
  console.log("obviousMoves:", obviousMoves);

  if (obviousMoves < 1) {
    validator();
    // Nézzük hány textarea maradt még?
    const allTextArea = getAllTextAreasOnBoard();
    // Ha már csak egy maradt:
    if (allTextArea.length < 1) {
      alert("Nyertél, gratulálok!");
      id('controls').innerHTML = newGameButton;
      return;
    }

    alert(
      "Nincs több egyértelmű lépés! Válassz egy mezőt, aminek felfedjük az értékét!"
    );

    allTextArea.forEach((textarea) => {
      textarea.addEventListener("click", function (e) {
        console.log("klikk");
        
        revealACell(e.target.parentElement.id.match(/\d+/)[0]);
        document.querySelectorAll('.sudokuCell').forEach((cell)=>cell.classList="sudokuCell");
      });
      textarea.parentElement.classList.add('reveal-this-area');
      textarea.onblur = "";
    });
  }
}

function onBlurFunction(index) {
  setEveryPlaceHolders();
}

function getAllTextAreasOnBoard() {
  return document.getElementById("board").querySelectorAll("textarea");
}

function revealACell(index) {
  id(`id${index}`).innerHTML = teljesTablaFlat[index];
  const allTextArea = getAllTextAreasOnBoard();
  allTextArea.forEach((textarea) => {
    const replaceWidh = textarea.cloneNode();
    textarea.parentNode.replaceChild(replaceWidh, textarea);
  });
}

function validator() {
  let hibaSzam = 0;
  for (let i = 0; i < teljesTablaFlat.length; i++) {
    let numToCompare = cellContentNr(i);

    if (numToCompare == teljesTablaFlat[i]) {
      id(`id${i}`).textContent = numToCompare;
    } else {
      hibaSzam++;
    }
  }
  console.log("hibaSzam: ", hibaSzam);
}

// TESZT:

renderer();
dataFiller();
