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
    //Temporary console log // console.log('FormulaEvaluator line 21 of FormulaEvaluator:', formula);

    this._result = formula.length;
    //Temporary console log // console.log("FormulaEvaluator line 27 this._result = formula.length - result: " + this._result);

    //Temporary console log // console.log("FormulaEvaluator line 27 this._result = formula.length - result: " + this._result);
    this._errorMessage = "";

    if (true){// test for errors

    if (formula.length === 0) {
      this._errorMessage = ErrorMessages.emptyFormula;
      return;
    }

    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.partial;
      return;
    }
    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.divideByZero;
      return;
    }
    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.invalidCell;
      return;
    }
    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.invalidFormula;
      return;
    }
    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.invalidNumber;
      return;
    }
    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.invalidOperator;
      return;
    }
    if (false) {
      //TODO
      this._errorMessage = ErrorMessages.missingParentheses;
      return;
    }
    }
    
  
      try {
      // Start parsing from the beginning of the formula
      this._position = 0;
      this._result = this.expression(formula);
    } catch (error: any) {
    this._errorMessage = error?.message || "An unexpected error occurred";
}

  }


  expression(formula: FormulaType): number {
    let value = this.term(formula);
    while (this._position < formula.length && ['+', '-'].includes(formula[this._position])) {
      let operator = formula[this._position++];
      let nextTerm = this.term(formula);
      if (operator === '+') value += nextTerm;
      else value -= nextTerm;
    }
    return value;
  }

  term(formula: FormulaType) {
    let value = this.factor(formula);
    while (this._position < formula.length && ['*', '/'].includes(formula[this._position])) {
      let operator = formula[this._position++];
      let nextFactor = this.factor(formula);
      if (operator === '*') {
        value *= nextFactor;
      } else {
        if (nextFactor === 0) {
          throw new Error("Division by zero is not allowed!");
        }
        value /= nextFactor;
      }
      
    }
    return value;
  }

  factor(formula: FormulaType) {
    let token = formula[this._position++];

    if (this.isNumber(token)) {
      return Number(token);
    } else if (this.isCellReference(token)) {
      return this.getCellValue(token)[0]; // handle errors
    } else if (token === '(') {
      let value = this.expression(formula);
      if (formula[this._position++] !== ')') throw new Error("Missing closing parenthesis");
      return value;
    } else {
      throw new Error("Unexpected token in factor: " + token);
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