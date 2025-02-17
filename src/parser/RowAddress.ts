/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {
  absoluteSheetReference,
  invalidSimpleRowAddress,
  SimpleCellAddress,
  simpleRowAddress,
  SimpleRowAddress
} from '../Cell'
import {Maybe} from '../Maybe'
import {AddressWithRow} from './Address'
import {ReferenceType} from './ColumnAddress'

export class RowAddress implements AddressWithRow {
  private constructor(
    public readonly sheet: number | null,
    public readonly row: number,
    public readonly type: ReferenceType
  ) {}

  public static absolute(sheet: number | null, row: number) {
    return new RowAddress(sheet, row, ReferenceType.ABSOLUTE)
  }

  public static relative(sheet: number | null, row: number) {
    return new RowAddress(sheet, row, ReferenceType.RELATIVE)
  }

  public isRowAbsolute(): boolean {
    return (this.type === ReferenceType.ABSOLUTE)
  }

  public isRowRelative(): boolean {
    return (this.type === ReferenceType.RELATIVE)
  }

  public isAbsolute(): boolean {
    return (this.type === ReferenceType.ABSOLUTE && this.sheet !== null)
  }

  public moved(toSheet: number, toRight: number, toBottom: number): RowAddress {
    const newSheet = this.sheet === null ? null : toSheet
    return new RowAddress(newSheet, this.row + toBottom, this.type)
  }

  public shiftedByRows(numberOfColumns: number): RowAddress {
    return new RowAddress(this.sheet, this.row + numberOfColumns, this.type)
  }

  public toSimpleRowAddress(baseAddress: SimpleCellAddress): SimpleRowAddress {
    const sheet = absoluteSheetReference(this, baseAddress)
    let row = this.row
    if (this.isRowRelative()) {
      row = baseAddress.row + this.row
    }
    return simpleRowAddress(sheet, row)
  }

  public shiftRelativeDimensions(toRight: number, toBottom: number): RowAddress {
    const row = this.isRowRelative() ? this.row + toBottom : this.row
    return new RowAddress(this.sheet, row, this.type)
  }

  public shiftAbsoluteDimensions(toRight: number, toBottom: number): RowAddress {
    const row = this.isRowAbsolute() ? this.row + toBottom : this.row
    return new RowAddress(this.sheet, row, this.type)
  }

  public withAbsoluteSheet(sheet: number): RowAddress {
    return new RowAddress(sheet, this.row, this.type)
  }

  public isInvalid(baseAddress: SimpleCellAddress): boolean {
    return this.toSimpleRowAddress(baseAddress).row < 0
  }

  public hash(withSheet: boolean): string {
    const sheetPart = withSheet && this.sheet !== null ? `#${this.sheet}` : ''
    switch (this.type) {
      case ReferenceType.RELATIVE: {
        return `${sheetPart}#ROWR${this.row}`
      }
      case ReferenceType.ABSOLUTE: {
        return `${sheetPart}#ROWA${this.row}`
      }
    }
  }

  public unparse(baseAddress: SimpleCellAddress): Maybe<string> {
    const simpleAddress = this.toSimpleRowAddress(baseAddress)
    if(invalidSimpleRowAddress(simpleAddress)) {
      return undefined
    }
    const dollar = this.type === ReferenceType.ABSOLUTE ? '$' : ''
    return `${dollar}${simpleAddress.row + 1}`
  }

  public exceedsSheetSizeLimits(maxRows: number): boolean {
    return this.row >= maxRows
  }
}
