/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {CellError, ErrorType, SimpleCellAddress} from '../../Cell'
import {FormulaCellVertex, MatrixVertex} from '../../DependencyGraph'
import {ErrorMessage} from '../../error-message'
import {AstNodeType, ProcedureAst} from '../../parser'
import {EmptyValue, InternalScalarValue, isExtendedNumber} from '../InterpreterValue'
import {SimpleRangeValue} from '../SimpleRangeValue'
import {ArgumentTypes, FunctionPlugin} from './FunctionPlugin'

/**
 * Interpreter plugin containing information functions
 */
export class InformationPlugin extends FunctionPlugin {
  public static implementedFunctions = {
    'COLUMN': {
      method: 'column',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR, optional: true}
      ],
      isDependentOnSheetStructureChange: true,
      doesNotNeedArgumentsToBeComputed: true,
    },
    'COLUMNS': {
      method: 'columns',
      isDependentOnSheetStructureChange: true,
      doesNotNeedArgumentsToBeComputed: true,
    },
    'ISBINARY': {
      method: 'isbinary',
      parameters: [
        {argumentType: ArgumentTypes.STRING}
      ]
    },
    'ISERR': {
      method: 'iserr',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISFORMULA': {
      method: 'isformula',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR}
      ],
      doesNotNeedArgumentsToBeComputed: true
    },
    'ISNA': {
      method: 'isna',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISREF': {
      method: 'isref',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISERROR': {
      method: 'iserror',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISBLANK': {
      method: 'isblank',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISNUMBER': {
      method: 'isnumber',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISLOGICAL': {
      method: 'islogical',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISTEXT': {
      method: 'istext',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'ISNONTEXT': {
      method: 'isnontext',
      parameters: [
        {argumentType: ArgumentTypes.SCALAR}
      ]
    },
    'INDEX': {
      method: 'index',
      parameters: [
        {argumentType: ArgumentTypes.RANGE},
        {argumentType: ArgumentTypes.NUMBER},
        {argumentType: ArgumentTypes.NUMBER, defaultValue: 1},
      ]
    },
    'NA': {
      method: 'na'
    },
    'ROW': {
      method: 'row',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR, optional: true}
      ],
      isDependentOnSheetStructureChange: true,
      doesNotNeedArgumentsToBeComputed: true,
    },
    'ROWS': {
      method: 'rows',
      isDependentOnSheetStructureChange: true,
      doesNotNeedArgumentsToBeComputed: true,
    },
    'SHEET': {
      method: 'sheet',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR}
      ],
      doesNotNeedArgumentsToBeComputed: true
    },
    'SHEETS': {
      method: 'sheets',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR}
      ],
      doesNotNeedArgumentsToBeComputed: true
    }
  }

  /**
   * Corresponds to ISBINARY(value)
   *
   * Returns true if provided value is a valid binary number
   *
   * @param ast
   * @param formulaAddress
   */
  public isbinary(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISBINARY'), (arg: string) =>
      /^[01]{1,10}$/.test(arg)
    )
  }

  /**
   * Corresponds to ISERR(value)
   *
   * Returns true if provided value is an error except #N/A!
   *
   * @param ast
   * @param formulaAddress
   */
  public iserr(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISERR'), (arg: InternalScalarValue) =>
      (arg instanceof CellError && arg.type !== ErrorType.NA)
    )
  }

  /**
   * Corresponds to ISERROR(value)
   *
   * Checks whether provided value is an error
   *
   * @param ast
   * @param formulaAddress
   */
  public iserror(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISERROR'), (arg: InternalScalarValue) =>
      (arg instanceof CellError)
    )
  }

  /**
   * Corresponds to ISFORMULA(value)
   *
   * Checks whether referenced cell is a formula
   *
   * @param ast
   * @param formulaAddress
   */
  public isformula(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunctionWithReferenceArgument(ast.args, formulaAddress, this.metadata('ISFORMULA'),
      () => new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber),
      (reference: SimpleCellAddress) => {
        const vertex = this.dependencyGraph.addressMapping.getCell(reference)
        return vertex instanceof FormulaCellVertex || (vertex instanceof MatrixVertex && vertex.isFormula())
      }
    )
  }

  /**
   * Corresponds to ISBLANK(value)
   *
   * Checks whether provided cell reference is empty
   *
   * @param ast
   * @param formulaAddress
   */
  public isblank(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISBLANK'), (arg: InternalScalarValue) =>
      (arg === EmptyValue)
    )
  }

  /**
   * Corresponds to ISNA(value)
   *
   * Returns true if provided value is #N/A! error
   *
   * @param ast
   * @param formulaAddress
   */
  public isna(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISNA'), (arg: InternalScalarValue) =>
      (arg instanceof CellError && arg.type == ErrorType.NA)
    )
  }

  /**
   * Corresponds to ISNUMBER(value)
   *
   * Checks whether provided cell reference is a number
   *
   * @param ast
   * @param formulaAddress
   */
  public isnumber(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISNUMBER'), isExtendedNumber)
  }

  /**
   * Corresponds to ISLOGICAL(value)
   *
   * Checks whether provided cell reference is of logical type
   *
   * @param ast
   * @param formulaAddress
   */
  public islogical(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISLOGICAL'), (arg: InternalScalarValue) =>
      (typeof arg === 'boolean')
    )
  }

  /**
   * Corresponds to ISREF(value)
   *
   * Returns true if provided value is #REF! error
   *
   * @param ast
   * @param formulaAddress
   */
  public isref(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISREF'), (arg: InternalScalarValue) =>
      (arg instanceof CellError && (arg.type == ErrorType.REF || arg.type == ErrorType.CYCLE))
    )
  }

  /**
   * Corresponds to ISTEXT(value)
   *
   * Checks whether provided cell reference is of logical type
   *
   * @param ast
   * @param formulaAddress
   */
  public istext(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISTEXT'), (arg: InternalScalarValue) =>
      (typeof arg === 'string')
    )
  }

  /**
   * Corresponds to ISNONTEXT(value)
   *
   * Checks whether provided cell reference is of logical type
   *
   * @param ast
   * @param formulaAddress
   */
  public isnontext(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('ISNONTEXT'), (arg: InternalScalarValue) =>
      !(typeof arg === 'string')
    )
  }

  /**
   * Corresponds to COLUMN(reference)
   *
   * Returns column number of a reference or a formula cell if reference not provided
   *
   * @param ast
   * @param formulaAddress
   */
  public column(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunctionWithReferenceArgument(ast.args, formulaAddress, this.metadata('COLUMN'),
      () => formulaAddress.col + 1,
      (reference: SimpleCellAddress) => reference.col + 1
    )
  }

  /**
   * Corresponds to COLUMNS(range)
   *
   * Returns number of columns in provided range of cells
   *
   * @param ast
   * @param formulaAddress
   */
  public columns(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    if (ast.args.length !== 1) {
      return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber)
    }
    if (ast.args.some((astIt) => astIt.type === AstNodeType.EMPTY)) {
      return new CellError(ErrorType.NUM, ErrorMessage.EmptyArg)
    }
    const rangeAst = ast.args[0]
    if (rangeAst.type === AstNodeType.CELL_RANGE) {
      return rangeAst.end.col - rangeAst.start.col + 1
    } else {
      return new CellError(ErrorType.VALUE, ErrorMessage.CellRangeExpected)
    }
  }

  /**
   * Corresponds to ROW(reference)
   *
   * Returns row number of a reference or a formula cell if reference not provided
   *
   * @param ast
   * @param formulaAddress
   */
  public row(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunctionWithReferenceArgument(ast.args, formulaAddress, this.metadata('ROW'),
      () => formulaAddress.row + 1,
      (reference: SimpleCellAddress) => reference.row + 1
    )
  }

  /**
   * Corresponds to ROWS(range)
   *
   * Returns number of rows in provided range of cells
   *
   * @param ast
   * @param formulaAddress
   */
  public rows(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    if (ast.args.length !== 1) {
      return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber)
    }
    if (ast.args.some((astIt) => astIt.type === AstNodeType.EMPTY)) {
      return new CellError(ErrorType.NUM, ErrorMessage.EmptyArg)
    }
    const rangeAst = ast.args[0]
    if (rangeAst.type === AstNodeType.CELL_RANGE) {
      return rangeAst.end.row - rangeAst.start.row + 1
    } else {
      return new CellError(ErrorType.VALUE, ErrorMessage.CellRangeExpected)
    }
  }

  /**
   * Corresponds to INDEX(range;)
   *
   * Returns number of rows in provided range of cells
   *
   * @param ast
   * @param formulaAddress
   */
  public index(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunction(ast.args, formulaAddress, this.metadata('INDEX'), (rangeValue: SimpleRangeValue, row: number, col: number) => {
      if (col < 1 || row < 1) {
        return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne)
      }
      if (col > rangeValue.width() || row > rangeValue.height()) {
        return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge)
      }
      const range = rangeValue.range()
      if (range === undefined) {
        return rangeValue.topLeftCornerValue() ?? new CellError(ErrorType.VALUE, ErrorMessage.CellRangeExpected)
      }
      const address = range.getAddress(col - 1, row - 1)
      return this.dependencyGraph.getScalarValue(address)
    })
  }

  /**
   * Corresponds to NA()
   *
   * Returns #N/A!
   *
   * @param _ast
   * @param _formulaAddress
   */
  public na(_ast: ProcedureAst, _formulaAddress: SimpleCellAddress): CellError {
    return new CellError(ErrorType.NA)
  }

  /**
   * Corresponds to SHEET(value)
   *
   * Returns sheet number of a given value or a formula sheet number if no argument is provided
   *
   * @param ast
   * @param formulaAddress
   * */
  public sheet(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunctionWithReferenceArgument(ast.args, formulaAddress, {parameters: [{argumentType: ArgumentTypes.STRING}]},
      () => formulaAddress.sheet + 1,
      (reference: SimpleCellAddress) => reference.sheet + 1,
      (value: string) => {
        const sheetNumber = this.dependencyGraph.sheetMapping.get(value)
        if (sheetNumber !== undefined) {
          return sheetNumber + 1
        } else {
          return new CellError(ErrorType.NA, ErrorMessage.SheetRef)
        }
      }
    )
  }

  /**
   * Corresponds to SHEETS(value)
   *
   * Returns number of sheet of a given reference or number of all sheets in workbook when no argument is provided.
   * It returns always 1 for a valid reference as 3D references are not supported.
   *
   * @param ast
   * @param formulaAddress
   * */
  public sheets(ast: ProcedureAst, formulaAddress: SimpleCellAddress): InternalScalarValue {
    return this.runFunctionWithReferenceArgument(ast.args, formulaAddress, {parameters: [{argumentType: ArgumentTypes.STRING}]},
      () => this.dependencyGraph.sheetMapping.numberOfSheets(), // return number of sheets if no argument
      () => 1, // return 1 for valid reference
      () => new CellError(ErrorType.VALUE, ErrorMessage.CellRefExpected) // error otherwise
    )
  }
}
