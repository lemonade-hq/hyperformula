import {EmptyValue, CellError, CellValue, ErrorType} from '../Cell'
import {stringToDateNumber} from '../Date'
import {InterpreterValue, SimpleRangeValue} from './InterpreterValue'

/**
 * Converts cell value to date number representation (days after 12th Dec 1899)
 *
 * If value is a number simply returns value
 * If value is a string, it tries to parse it with date format
 *
 *
 * @param arg - cell value
 * @param dateFormat - date format pattern used when argument is a text
 */
export function dateNumberRepresentation(arg: InterpreterValue, dateFormat: string): number | null {
  if (typeof arg === 'number') {
    return arg
  } else if (typeof arg === 'string') {
    return stringToDateNumber(arg, dateFormat)
  } else {
    return null
  }
}

/**
 * Converts cell value to boolean representation
 *
 * if value is a boolean simply returns value
 * if value is a number return true if value is different than 0
 *
 * @param arg
 */
export function booleanRepresentation(arg: InterpreterValue): boolean | CellError {
  if (typeof arg === 'number') {
    return arg !== 0
  } else if (typeof arg === 'boolean') {
    return arg
  } else {
    return new CellError(ErrorType.VALUE)
  }
}

export function coerceToRange(arg: InterpreterValue): SimpleRangeValue {
  if (arg instanceof SimpleRangeValue) {
    return arg
  } else {
    return SimpleRangeValue.fromScalar(arg)
  }
}

export function coerceToRangeNumbersOrError(arg: InterpreterValue): SimpleRangeValue | CellError | null {
  if ((arg instanceof SimpleRangeValue && arg.hasOnlyNumbers()) || arg instanceof CellError) {
    return arg
  } else if (typeof arg === 'number') {
    return SimpleRangeValue.fromScalar(arg)
  } else {
    return null
  }
}

export function coerceScalarToNumber(arg: CellValue): number | CellError {
  if (arg === EmptyValue) {
    return 0
  }
  if (arg instanceof CellError) {
    return arg
  }
  const coercedNumber = Number(arg)
  if (isNaN(coercedNumber)) {
    return new CellError(ErrorType.VALUE)
  } else {
    return coercedNumber
  }
}
