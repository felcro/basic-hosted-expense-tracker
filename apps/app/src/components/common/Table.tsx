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
import { TableDeleteButton } from './TableDeleteButton'

const styles = StyleSheet.create((theme) => ({
  table: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  },
  allCells: {
    paddingHorizontal: theme.gap(1),
    borderColor: theme.colors.accents.coral,
  },
  title: {
    paddingVertical: theme.gap(2),
  },
  borders: {
    borderColor: `${theme.colors.dimmed}!important`,
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
  loadingCachedData?: Partial<T>
  deletable?: boolean
}

export function Table<T extends Id>({
  data,
  columns,
  dataPending,
  loadingCachedData,
  deletable = false,
}: TableProps<T>) {
  const { theme } = useUnistyles()

  // If columns are provided, use these as soon as available.
  // If columns are not provided, fallback to inferring titles from the data.
  const resolvedColumns =
    columns ??
    (!dataPending && data[0] ? (Object.keys(data[0]) as Array<keyof T>) : [])

  const [page, setPage] = useState<number>(0)
  const [numberOfItemsPerPageList] = useState<Array<number>>([5, 10, 20])
  const [itemsPerPage, onItemsPerPageChange] = useState<number>(
    numberOfItemsPerPageList[0] ?? 10,
  )
  const from = page * itemsPerPage
  const to = Math.min((page + 1) * itemsPerPage, data.length)

  const skeletonColumnCount = resolvedColumns.length || 3
  const isNumericColumn = (col: keyof T) => typeof data[0]?.[col] === 'number'

  return (
    <DataTable style={styles.table}>
      <DataTableHeader style={styles.borders}>
        {resolvedColumns.map((column, i) => {
          const colName = String(column)
          return (
            <DataTableTitle
              key={i}
              numeric={isNumericColumn(column)}
              style={[styles.allCells, styles.title]}
              textStyle={theme.fonts.labelMedium}
            >
              {colName.charAt(0).toUpperCase() + colName.slice(1)}
            </DataTableTitle>
          )
        })}
        {deletable && (
          <DataTableTitle
            key="delete"
            style={[styles.allCells, styles.title]}
            textStyle={theme.fonts.labelMedium}
          >
            Delete
          </DataTableTitle>
        )}
      </DataTableHeader>

      {loadingCachedData && (
        <DataTableRow key={loadingCachedData.id} style={styles.borders}>
          {resolvedColumns.map((col) => {
            return (
              <DataTableCell
                key={String(col)}
                numeric={typeof loadingCachedData[col] === 'number'}
                style={[styles.allCells]}
              >
                {loadingCachedData[col] ? (
                  String(loadingCachedData[col])
                ) : (
                  <SkeletonBone width="60%" height={12} />
                )}
              </DataTableCell>
            )
          })}
        </DataTableRow>
      )}

      {dataPending ? (
        <DataTableRow key={0}>
          {Array.from({ length: skeletonColumnCount }).map((_, i) => (
            <DataTableCell key={i} style={[styles.allCells]}>
              <SkeletonBone width="60%" height={12} />
            </DataTableCell>
          ))}
        </DataTableRow>
      ) : (
        data.slice(from, to).map((row) => (
          <DataTableRow key={row?.id} style={styles.borders}>
            {resolvedColumns.map((col) => {
              return (
                <DataTableCell
                  key={String(col)}
                  numeric={typeof row[col] === 'number'}
                  style={styles.allCells}
                >
                  {String(row[col])}
                </DataTableCell>
              )
            })}
            {deletable && (
              <DataTableCell key="delete" style={styles.allCells}>
                <TableDeleteButton id={Number(row.id)} />
              </DataTableCell>
            )}
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
