import Cell from "./Cell"
import SheetMemory from "./SheetMemory"
import { ErrorMessages } from "./GlobalDefinitions";



export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;
  private _position = 0;

  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
    this._position = 0;
  }

  evaluate(formula: FormulaType) {
    this._result = formula.length;
    this._errorMessage = "";

    

    if (formula.length === 0) {
      this._errorMessage = ErrorMessages.emptyFormula;
      return;
    }
    try {

      // Initial basic error checking
      let openCount = 0; // use to count pairs of parenthesis 
      let closeCount = 0;
      let regex = /^[A-Z][1-9][0-9]?$/;
      
      // loop through formula
      for (let index = 0; index < formula.length; index++) {
          let currentElement = formula[index];
          let prevElement = index > 0 ? formula[index - 1] : undefined;
          let nextElement = index < formula.length - 1 ? formula[index + 1] : undefined;
      
          // Counting parentheses
          if (currentElement === '(') {
            // Logic for opening brackets errors
              openCount++;
      
              // Check preceding element if it exists to ensure validity
              if (prevElement && !['+', '-', '*', '/'].includes(prevElement)) {
                  this._errorMessage = ErrorMessages.invalidFormula;
                  break;
              }
              // Check following element to ensure validity
              if (nextElement && !(regex.test(nextElement) || !isNaN(nextElement))) {
                  this._errorMessage = ErrorMessages.invalidFormula;
                  break;
              }
          } else if (currentElement === ')') {
            // logic for closing parenthesis 
              closeCount++;
      
              // Check preceding element to ensure validity
              if (prevElement && !(regex.test(prevElement) || !isNaN(prevElement))) {
                  this._errorMessage = ErrorMessages.invalidFormula;
                  break;
              }
              // Check following element to ensure validity
              if (nextElement && !['+', '-', '*', '/', ')'].includes(nextElement)) {
                  this._errorMessage = ErrorMessages.invalidFormula;
                  break;
              }
          }
      
          // Check for pattern validity to make sure we have operators between values
          if (regex.test(currentElement) && nextElement) {
              if (!['+', '-', '*', '/', '(', ')'].includes(nextElement)) {
                  this._errorMessage = ErrorMessages.invalidFormula;
                  break;
              }
          }
      }
      // throw error is unpaired parenthesis, mismatched ones are caught later
      if (openCount !== closeCount) {
          this._errorMessage = ErrorMessages.missingParentheses;
      }
      


      // Start parsing from the beginning of the formula
      this._position = 0;
      this._result = this.expression(formula);

    } catch (error: any) {
      this._errorMessage = error?.message || "An unexpected error occurred";
    }

  }

  // Method that handles + and -
  // Calls term to handle  * and  / 
  expression(formula: FormulaType): number {
    // console.log(formula);
    let value = this.term(formula);

    while (this._position < formula.length && ['+', '-'].includes(formula[this._position])) {
      let operator = formula[this._position++];
      let nextTerm = this.term(formula);
      if (operator === '+') value += nextTerm;
      else value -= nextTerm;
    }
    return value;
  }

  // method that handles * and / 
  // calls factor to handle brackets
  term(formula: FormulaType) {
    // console.log("initial: " + formula[this._position]);
    let value = this.factor(formula);
    // console.log("secondary: " + formula[this._position]);

    //Error check - did we miss a operator - cell
    if(Cell.isValidCellLabel(formula[this._position])){
      this._errorMessage = ErrorMessages.invalidFormula;
      return 0;
    }

    while (this._position < formula.length && ['*', '/'].includes(formula[this._position])) {
      let operator = formula[this._position++];
      let nextFactor = this.factor(formula);
      if (operator === '*') {
        value *= nextFactor;
      } else {
        if (nextFactor === 0) {
          // throw new Error( ErrorMessages.divideByZero);
          this._errorMessage = ErrorMessages.divideByZero;
          value = Infinity;
        } else {
          value /= nextFactor;
        }
      }

    }
    return value;
  }

  // lowest level and first to occur. Handles brackets
  factor(formula: FormulaType) {
    
    let token = formula[this._position++];
    // console.log("formula: " , formula);
    // console.log("token: " + token);
    
    if (this.isNumber(token)) {
      return Number(token);
    } else if (this.isCellReference(token)) {
      // if a cell reference return value unless error
      let [value, error] = this.getCellValue(token);
      if (error) { // pass up error
        this._errorMessage = error;
        return 0;
      }
      return value;
    } else if (token === '(') {
      let value = this.expression(formula);
      if (formula[this._position++] !== ')') {
        this._errorMessage = ErrorMessages.missingParentheses;
        return 0;
      }
      return value;
    } else {
      // check if not an operator - e.g. cell reference
      if (!['+', '-', '*', '/'].includes(token)) {
        // console.log('Invalid token' + token);
        this._errorMessage = ErrorMessages.invalidFormula;
        return 0;
      } else {
        // following have the same error code so this 
        // Handles invalidNumber
        // Handles invalidFormula
        // Handles invalidOperator
        // - if not caught before in earlier checks
        
        this._errorMessage = ErrorMessages.invalidFormula;
        return 0;
      }
    }
  }



  public get error(): string {
    return this._errorMessage
  }

  public get result(): number {
    return this._result;
  }


  /**
   * 
   * @param token 
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   * 
   * @param token
   * @returns true if the token is a cell reference
   * 
   */
  isCellReference(token: TokenType): boolean {

    return Cell.isValidCellLabel(token);
  }

  /**
   * 
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   * 
   */
  getCellValue(token: TokenType): [number, string] {

    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }


    let value = cell.getValue();
    return [value, ""];

  }


}

export default FormulaEvaluator;