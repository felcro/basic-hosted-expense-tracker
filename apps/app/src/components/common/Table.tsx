import { useState } from 'react'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
  DataTable,
  DataTableCell,
  DataTableHeader,
  DataTablePagination,
  DataTableRow,
  DataTableTitle,
} from '../rnp-unistyles/DataTable'
import { SkeletonBone } from './SkeletonBone'

const styles = StyleSheet.create((theme) => ({
  table: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  allCells: {
    paddingHorizontal: theme.gap(1),
  },
  cellLeftBorders: {
    borderLeftWidth: 1,
    borderColor: theme.colors.dimmed,
  },
  title: {
    paddingVertical: theme.gap(2),
  },
}))

type Id = {
  id: number | string
}

export type TableProps<T extends Id> = {
  data: Array<T>
  dataPending?: boolean
  /** Provide the columns to render the header ahead of the table data */
  columns?: Array<keyof T>
  columnsPending?: boolean
}

export function Table<T extends Id>({
  data,
  columns,
  dataPending,
  columnsPending,
}: TableProps<T>) {
  const { theme } = useUnistyles()

  // If columns are provided, use these as soon as available.
  // If columns are not provided, fallback to inferring titles from the data.
  const resolvedColumns =
    columns ??
    (!columnsPending && data[0] ? (Object.keys(data[0]) as Array<keyof T>) : [])

  const [page, setPage] = useState<number>(0)
  const [numberOfItemsPerPageList] = useState<Array<number>>([2, 3, 4])
  const [itemsPerPage, onItemsPerPageChange] = useState<number>(
    numberOfItemsPerPageList[0] ?? 10,
  )
  const from = page * itemsPerPage
  const to = Math.min((page + 1) * itemsPerPage, data.length)

  const skeletonColumnCount = resolvedColumns.length || 3
  const isNumericColumn = (col: keyof T) => typeof data[0]?.[col] === 'number'

  return (
    <DataTable style={styles.table}>
      <DataTableHeader>
        {columnsPending
          ? Array.from({ length: skeletonColumnCount }).map((_, i) => (
              <DataTableCell key={i} style={[styles.allCells, styles.title]}>
                <SkeletonBone width="60%" height={14} />
              </DataTableCell>
            ))
          : resolvedColumns.map((column, i) => {
              return (
                <DataTableTitle
                  key={i}
                  numeric={isNumericColumn(column)}
                  style={[styles.allCells, styles.title]}
                  textStyle={theme.fonts.labelMedium}
                >
                  {String(column)}
                </DataTableTitle>
              )
            })}
      </DataTableHeader>

      {dataPending || columnsPending ? (
        <DataTableRow key={0}>
          {Array.from({ length: skeletonColumnCount }).map((_, i) => (
            <DataTableCell key={i} style={[styles.allCells]}>
              <SkeletonBone width="60%" height={12} />
            </DataTableCell>
          ))}
        </DataTableRow>
      ) : (
        data.slice(from, to).map((row) => (
          <DataTableRow key={row?.id}>
            {resolvedColumns.map((col) => {
              // Include this commented out code if cell borders are desired.
              // const firstCell = i === 0 // Remember to expose the 2nd arg 'i' in the callbackk fn
              return (
                <DataTableCell
                  key={String(col)}
                  numeric={typeof row[col] === 'number'}
                  style={[
                    styles.allCells /*!firstCell && styles.cellLeftBorders*/,
                  ]}
                >
                  {String(row[col])}
                </DataTableCell>
              )
            })}
          </DataTableRow>
        ))
      )}

      <DataTablePagination
        page={page}
        numberOfPages={Math.ceil(data.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${data.length}`}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          onItemsPerPageChange(value)
          setPage(0)
        }}
        showFastPaginationControls
        selectPageDropdownLabel={'Rows per page'}
        style={styles.allCells}
      />
    </DataTable>
  )
}
